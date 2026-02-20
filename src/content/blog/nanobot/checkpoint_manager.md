---
title: nanobot-checkpoint_manager
description: ''
pubDate: '2026-1-18'
tags: ['nanobot', 'checkpoint_manager']
slug: 'nanobot/checkpoint_manager'
---

## 文件作用

管理深度学习训练的 checkpoint 保存和加载，支持断点续训、模型评估和推理。

## 核心设计模式与最佳实践

### 1. **向后兼容的配置演化**

```python
def _patch_missing_config_keys(model_config_kwargs):
    if "window_pattern" not in model_config_kwargs:
        model_config_kwargs["window_pattern"] = "L"
```

**学习点**：

- 当模型配置迭代时（如添加新特性），旧 checkpoint 缺少新字段会导致加载失败
- 用 patching 函数在加载时自动补全默认值，保证老模型仍可用
- 适用场景：长期项目、需要支持多版本模型共存

**实践建议**：

- 记录每次配置变更，明确默认值的语义（如 `window_pattern="L"` 表示旧模型是全上下文）
- 在 patch 函数中添加日志，追踪哪些模型被修复了

---

### 2. **分布式训练的优化器状态管理**

```python
# 模型参数只由 rank 0 保存（所有进程共享）
if rank == 0:
    torch.save(model_data, model_path)

# 优化器状态每个 rank 都要保存（各进程独立）
if optimizer_data is not None:
    optimizer_path = f"optim_{step:06d}_rank{rank:d}.pt"
    torch.save(optimizer_data, optimizer_path)
```

**学习点**：

- 分布式训练中，模型权重在所有进程间同步，只需保存一份
- 优化器状态（momentum、variance 等）因参数分片而不同，每个 rank 需独立保存
- 文件命名带 `rank` 后缀，加载时按当前 rank 读取对应文件

**实践建议**：

- 使用 DDP 时，确保 `rank == 0` 的条件判断避免重复写入
- 加载时验证 rank 文件存在性，防止分布式配置不匹配

---

### 3. **设备兼容的数据类型处理**

```python
if device.type in {"cpu", "mps"}:
    model_data = {
        k: v.float() if v.dtype == torch.bfloat16 else v
        for k, v in model_data.items()
    }
```

**学习点**：

- GPU 训练常用 `bfloat16` 节省显存，但 CPU/MPS 不支持该格式
- 加载时根据目标设备动态转换数据类型，避免运行时错误
- 字典推导式实现优雅的批量转换

**实践建议**：

- 在 GPU 训练、CPU 推理的场景下必须处理
- 考虑扩展到其他类型（如 `float16` → `float32`）

---

### 4. **Meta Device 初始化优化**

```python
with torch.device("meta"):
    model = GPT(model_config)
model.to_empty(device=device)
model.load_state_dict(model_data, strict=True, assign=True)
```

**学习点**：

- `meta` device 创建模型时不分配实际内存（只记录形状/dtype）
- `to_empty()` 在目标设备上分配空内存
- `load_state_dict(assign=True)` 直接替换张量，避免多余拷贝

**优势**：

- 大模型加载时显存峰值降低（不需要同时存在初始化权重 + checkpoint 权重）
- 加载速度提升（减少内存分配和拷贝）

**注意事项**：

- 代码中有 TODO 注释：`model.init_weights()` 重复初始化了 rotary embeddings，需要优化
- `assign=True` 要求 checkpoint 中的张量形状与模型完全匹配

---

### 5. **处理 torch.compile 的命名前缀**

```python
model_data = {k.removeprefix("_orig_mod."): v for k, v in model_data.items()}
```

**学习点**：

- `torch.compile()` 会给所有参数名加 `_orig_mod.` 前缀
- 保存编译后的模型再加载到非编译模型时需要去掉前缀
- Python 3.9+ 的 `removeprefix()` 方法简洁处理

**实践建议**：

- 标准化保存策略：统一保存原始模型（`model._orig_mod` 或通过 `model.state_dict()` 时strip prefix）
- 在加载时兼容两种情况（有/无前缀）

---

### 6. **智能默认值推导**

```python
def find_largest_model(checkpoints_dir):
    # 1) 尝试解析 d<数字> 格式，选最大的
    candidates = []
    for model_tag in model_tags:
        match = re.match(r"d(\d+)", model_tag)
        if match:
            candidates.append((int(match.group(1)), model_tag))
    # 2) 回退到最新修改时间
    if not candidates:
        model_tags.sort(key=lambda x: os.path.getmtime(...))
```

**学习点**：

- 多层次回退策略：先按语义规则（模型大小）→ 再按时间戳
- 正则匹配提取关键信息（`d12` → 12）
- 用户可省略参数，系统自动选择"最可能需要的"

**实践建议**：

- 设计良好的默认行为减少用户配置负担
- 日志输出推导结果（如 `log0(f"Guessing model tag: {model_tag}")`），方便调试

---

### 7. **三层抽象的 API 设计**

```python
# 低层：直接操作文件
save_checkpoint(checkpoint_dir, step, ...)
load_checkpoint(checkpoint_dir, step, ...)

# 中层：从目录构建完整模型
build_model(checkpoint_dir, step, device, phase)

# 高层：按项目约定加载
load_model("sft", device, "eval")  # 自动映射到 chatsft_checkpoints
```

**学习点**：

- **低层**：提供最大灵活性，适合自定义场景
- **中层**：封装常用组合（模型 + tokenizer + meta），减少重复代码
- **高层**：业务语义化接口，隐藏目录结构细节

**设计原则**：

- 每层向上抽象，向下透传参数
- 用户根据场景选择合适的层级（快速原型用高层，定制需求用低层）

---

### 8. **元数据的结构化存储**

```python
# 保存为 JSON 而非 pickle
meta_path = os.path.join(checkpoint_dir, f"meta_{step:06d}.json")
with open(meta_path, "w", encoding="utf-8") as f:
    json.dump(meta_data, f, indent=2)
```

**学习点**：

- JSON 格式人类可读，便于检查配置错误
- 避免 pickle 的安全风险和跨版本兼容问题
- `indent=2` 提升可读性

**实践建议**：

- 元数据包括：模型配置、训练超参、数据集信息、tokenizer 版本等
- 加载时验证关键字段（如 vocab_size 与 tokenizer 一致性检查）

---

### 9. **日志的分布式友好设计**

```python
def log0(message):
    if int(os.environ.get('RANK', 0)) == 0:
        logger.info(message)
```

**学习点**：

- 分布式训练时，多进程同时打印日志会混乱
- 只让主进程（rank 0）输出，保持日志清晰
- 通过环境变量 `RANK` 判断当前进程身份

**实践建议**：

- 所有用户可见的日志用 `log0()`
- 调试时可临时允许所有 rank 打印（如 `logger.debug()`）

---

## 可改进的地方

1. **重复初始化问题**（代码中已有 TODO）：

   ```python
   model.init_weights() # note: this is dumb, but we need to init the rotary embeddings. TODO: fix model re-init
   ```

   - 应该让 rotary embedding 支持延迟初始化，避免浪费计算

2. **错误处理不足**：

   - `load_checkpoint()` 文件不存在时会抛出原始异常，可提供更友好的错误信息
   - 可添加 checksum 验证，防止文件损坏

3. **缺少清理功能**：

   - 训练产生大量 checkpoint，应提供删除旧 checkpoint 的工具（保留最新 N 个或按时间清理）

4. **硬编码的目录映射**：
   - `load_model()` 的四个 source 写死，可改为配置文件或环境变量

---

## 使用示例

### 断点续训

```python
# 加载最新的 SFT checkpoint，包括优化器状态
model_data, optimizer_data, meta_data = load_checkpoint(
    checkpoint_dir="chatsft_checkpoints/d12",
    step=5000,
    device=torch.device("cuda"),
    load_optimizer=True,
    rank=int(os.environ.get('RANK', 0))
)
```

### 模型评估

```python
# 只加载模型权重，不加载优化器
model, tokenizer, meta = load_model(
    source="sft",
    device=torch.device("cuda"),
    phase="eval"
)
```

---

## 总结

这个文件展示了工业级 checkpoint 管理的核心技巧：

- ✅ 向后兼容的配置演化
- ✅ 分布式训练的状态管理
- ✅ 设备兼容的类型转换
- ✅ 内存高效的模型加载
- ✅ 多层次的 API 抽象
- ✅ 人类可读的元数据

适合学习深度学习工程化实践，可作为自己项目的参考模板（去掉项目定制部分）。
