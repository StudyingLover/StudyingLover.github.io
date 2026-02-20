---
title: nanobot-pre-train
description: ''
pubDate: '2026-1-18'
tags: ['nanobot', 'pre-train']
slug: 'nanobot/pre-train'
---

## 数据构造

- 每行都从 `[<|bos|>]`token开始
- 每条数据（row）100% token利用率(无padding)

具体做法：

先使用Tokenizer给每个文档前自动添加 `<|bos|>` token,然后初始化一个`row = []`,大小2049。假设buffer中有文档: 500 tokens, 800 tokens, 1200 tokens, 2500 tokens, remaining = 2049

1. 选最大的能放入的: 1200 tokens
   - `row = [doc1200]` 1200 tokens
   - remaining = 849
2. 再选最大的: 800 tokens
   - `row = doc1200, doc800]`
   - remaining = 49
3. 没有文档 ≤49, 裁剪最短的文档(500 tokens)
   - `row = [doc1200, doc800, doc500[:49]]`
   - 结束

> 不难发现，单个row中会存在多个BOS，这能让AI学会处理文档边界和上下文切换

## 实践经验

### Meta张量初始化（节省显存）

```python
with torch.device("meta"):
    model = GPT(config)  # 只有shape没有数据
model.to_empty(device=device)  # 分配存储但不初始化
model.init_weights()  # 最后才初始化
```

### 数据预取（Pipeline优化）

正常的非优化写法是在每个micro_step开始时取数据：

```python
for micro_step in range(grad_accum_steps):
    x, y, state = next(train_loader)  # ← 先取数据（GPU空闲等待）
    loss = model(x, y)                 # 然后前向
    loss.backward()                    # 然后反向
```

这就存在问题，取数据时GPU闲置，等待CPU的I/O操作

这里的优化写法是

```python
x, y, state = next(train_loader)  # 循环前取第一批

for micro_step in range(grad_accum_steps):
    loss = model(x, y)                 # 前向（GPU忙）
    loss.backward()                    # 反向（GPU忙）
    x, y, state = next(train_loader)   # ← GPU计算时CPU异步准备下一批
```

GPU计算当前batch的同时，CPU可以并行地tokenize/加载下一批数据，隐藏I/O延迟，提高硬件利用率。

有人会有问题

- loss.backward() 还没算完，x, y, state = next(train_loader) 会执行吗
- 那会不会loss.backward() 还没算完,代码已经跑到最后了

在`loss.backward() ` 会异步启动GPU上的反向传播，但不会阻塞CPU，所以说下一行会正常执行。但是，会有三部分同步cpu和gpu

- `loss = model(x, y)`新的前向传播需要GPU资源，PyTorch会自动等待之前的kernel执行完毕
- `opt.step()` 更新参数需要梯度，会等待所有backward完成
- `synchronize()` 显式同步，这里的`synchronize()`是这样实现的`synchronize = torch.cuda.synchronize if device_type == "cuda" else lambda: None`

### MFU（模型FLOPs利用率）监控

MFU (Model FLOPs Utilization) 是衡量GPU硬件利用效率的关键指标。

- **MFU = 50%**：你充分利用了GPU理论算力的一半，**非常优秀**（Transformer训练通常30-50%）
- **MFU = 20%**：一般水平，有优化空间
- **MFU = 5%**：很差，可能有严重瓶颈（数据加载慢、显存不足、kernel效率低）
- 为什么达不到100%？

1. **内存带宽瓶颈**：读写数据耗时
2. **非计算操作**：LayerNorm、激活函数等
3. **通信开销**：DDP的AllReduce
4. **Kernel启动开销**：小操作的固定成本
5. **空闲等待**：数据加载、同步等

```python
num_flops_per_token = model.estimate_flops()
flops_per_sec = num_flops_per_token * batch_size / dt
total_peak = gpu_peak_flops * ddp_world_size
mfu = 100 * flops_per_sec / total_peak
```

- `num_flops_per_token`: 处理一个token需要的浮点运算数（前向+反向）
- `batch_size`: 一次处理多少个token
- `dt`: 实际耗时（秒）
- `gpu_peak_flops`: 单张GPU的理论峰值（BF16）

那怎么得到`gpu_peak_flops`呢？查表

```python
# hardcoded BF16 peak flops for various GPUs
# inspired by torchtitan: https://github.com/pytorch/torchtitan/blob/main/torchtitan/tools/utils.py
# and PR: https://github.com/karpathy/nanochat/pull/147
def get_peak_flops(device_name: str) -> float:
    name = device_name.lower()

    # --- NVIDIA Blackwell ---
    if "gb200" in name or "grace blackwell" in name:
        return 2.5e15
    if "b200" in name:
        return 2.25e15
    if "b100" in name:
        return 1.8e15

    # --- NVIDIA Hopper (H100/H200/H800) ---
    if "h200" in name:
        if "nvl" in name or "pcie" in name:
            return 836e12
        return 989e12  # H200 SXM
    if "h100" in name:
        if "nvl" in name:
            return 835e12
        if "pcie" in name:
            return 756e12
        return 989e12  # H100 SXM
    if "h800" in name:
        if "nvl" in name:
            return 989e12
        return 756e12  # H800 PCIe

    # --- NVIDIA Ampere data center ---
    if "a100" in name or "a800" in name:
        return 312e12
    if "a40" in name:
        return 149.7e12
    if "a30" in name:
        return 165e12

    # --- NVIDIA Ada data center ---
    if "l40s" in name or "l40-s" in name or "l40 s" in name:
        return 362e12
    if "l4" in name:
        return 121e12

    # --- AMD CDNA accelerators ---
    if "mi355" in name:
        return 2.5e15
    if "mi325" in name or "mi300x" in name:
        return 1.3074e15
    if "mi300a" in name:
        return 980.6e12
    if "mi250x" in name:
        return 383e12
    if "mi250" in name:
        return 362.1e12

    # --- Intel ---
    if "data center gpu max 1550" in name:
        # Ponte Vecchio (PVC) - dynamic based on compute units
        max_comp_units = torch.xpu.get_device_properties("xpu").max_compute_units
        return 512 * max_comp_units * 1300 * 10**6

    # --- Consumer RTX (for hobbyists) ---
    if "5090" in name:
        return 209.5e12
    if "4090" in name:
        return 165.2e12
    if "3090" in name:
        return 71e12

    # Unknown GPU - return inf so MFU shows as 0% rather than a wrong guess
    logger.warning(f"Peak flops undefined for: {device_name}, MFU will show as 0%")
    return float('inf')
```
