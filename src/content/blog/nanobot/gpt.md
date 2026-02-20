---
title: nanobot-gpt
description: ''
pubDate: '2026-1-18'
tags: ['nanobot', 'gpt']
slug: 'nanobot/gpt'
---

这个文件定义了gpt模型，以及对应的generate方法

## 配置

首先是各项配置

```python
@dataclass
class GPTConfig:
    sequence_len: int = 2048  # 最大序列长度
    vocab_size: int = 32768  # 词汇表大小
    n_layer: int = 12  # Transformer 的层数
    n_head: int = 6  # 查询头的数量
    n_kv_head: int = 6  # 键/值头的数量 (GQA)
    n_embd: int = 768  # 模型内部的隐藏维度
    window_pattern: str = "SSSL"
```

这里需要说下滑动窗口注意力模式，这是一个性能与质量的平衡方案。

- 前面层用短窗口 → 推理速度快，计算量少
- 每 3 层一个长窗口 → 定期收集完整上下文信息
- 最后一层必须 L → 确保输出层有完整的语义理解

| 层数 | 字符 | 窗口大小 | 含义                           |
| :--- | :--- | :------- | :----------------------------- |
| 0    | S    | 1024     | 只看前 1024 个词元             |
| 1    | S    | 1024     | 只看前 1024 个词元             |
| 2    | S    | 1024     | 只看前 1024 个词元             |
| 3    | L    | 2048     | 看所有词元（完整上下文）       |
| 4    | S    | 1024     | 只看前 1024 个词元（模式重复） |
| 5    | S    | 1024     | 只看前 1024 个词元             |
| 6    | S    | 1024     | 只看前 1024 个词元             |
| 7    | L    | 2048     | 看所有词元                     |
| 8    | S    | 1024     | 只看前 1024 个词元             |
| 9    | S    | 1024     | 只看前 1024 个词元             |
| 10   | S    | 1024     | 只看前 1024 个词元             |
| 11   | L    | 2048     | 看所有词元（最后一层强制L）    |

## 方法

### norm

这是 RMSNorm（Root Mean Square Normalization），一种更简单的归一化方法。

```python
def norm(x):
    # Purely functional rmsnorm with no learnable params
    return F.rms_norm(x, (x.size(-1),))
```

传统的LayerNorm是这样的

```python
# 有可学习参数
class LayerNorm(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.weight = nn.Parameter(torch.ones(dim))   # 可学习的缩放
        self.bias = nn.Parameter(torch.zeros(dim))     # 可学习的偏移

    def forward(self, x):
        mean = x.mean(-1, keepdim=True)
        std = x.std(-1, keepdim=True)
        return self.weight * (x - mean) / std + self.bias
```

| 特性           | LayerNorm        | RMSNorm（本代码） |
| -------------- | ---------------- | ----------------- |
| **减均值**     | ✅ 有            | ❌ 无             |
| **可学习参数** | ✅ weight & bias | ❌ 无参数         |
| **计算量**     | 较多             | 较少              |
| **效果**       | 好               | 相当或更好        |

### has_ve

给某些层额外加强，但要聪明地加——只加奇数层（或偶数层），这样既能提升模型，又不会太浪费参数。而且不管有多少层，最后一层肯定要加强！

```python
def has_ve(layer_idx, n_layer):
    """Returns True if GPT layer should have Value Embedding (alternating, last layer always included)."""
    return layer_idx % 2 == (n_layer - 1) % 2
```

### apply_rotary_emb

rope编码, 旋转变换，x的shape不变，然后返回。以前不看代码一直以为是concat的

```python
def apply_rotary_emb(x, cos, sin):
    assert x.ndim == 4  # multihead attention
    d = x.shape[3] // 2
    x1, x2 = x[..., :d], x[..., d:]  # split up last dim into two halves
    y1 = x1 * cos + x2 * sin  # rotate pairs of dims
    y2 = x1 * (-sin) + x2 * cos
    return torch.cat([y1, y2], 3)
```

## CausalSelfAttention

可以认为，这个类就是transformer的**注意力层**，多个head包含在里面

QKV三个矩阵和输出投影矩阵就是四个`nn.Linear`

```python
self.c_q = nn.Linear(self.n_embd, self.n_head * self.head_dim, bias=False)
        self.c_k = nn.Linear(self.n_embd, self.n_kv_head * self.head_dim, bias=False)
        self.c_v = nn.Linear(self.n_embd, self.n_kv_head * self.head_dim, bias=False)
        self.c_proj = nn.Linear(self.n_embd, self.n_embd, bias=False)

```

#### formard

输入x,通过QKV做投影，然后拆成多个头，后面会送进Flash Attention做运算

> 注意：拆成多个头计算不是显性的，nanochat未实现具体的计算，会通过fash attention的参数隐式完成

然后做旋转变换把位置信息揉进来

```python
cos, sin = cos_sin
        q, k = apply_rotary_emb(q, cos, sin), apply_rotary_emb(k, cos, sin)
        q, k = norm(q), norm(k)  # QK norm
```

- Q 和 K：参与点积计算相似度，需要控制数值范围
- V：只是被加权求和，不影响注意力分数的数值稳定性

最后调用一下flash attention,这里算的就是Concat(head_1, ..., head_n)

```python
if kv_cache is None:
            # Training: causal attention with optional sliding window
            y = flash_attn.flash_attn_func(
                q, k, v, causal=True, window_size=window_size
            )
        else:
            # Inference: use flash_attn_with_kvcache which handles cache management
            k_cache, v_cache = kv_cache.get_layer_cache(self.layer_idx)
            y = flash_attn.flash_attn_with_kvcache(
                q,
                k_cache,
                v_cache,
                k=k,
                v=v,
                cache_seqlens=kv_cache.cache_seqlens,
                causal=True,
                window_size=window_size,
            )
            # Advance position after last layer processes
            if self.layer_idx == kv_cache.n_layers - 1:
                kv_cache.advance(T)
```

最后通过线性层映射回原始的嵌入维度

```python
y = y.contiguous().view(B, T, -1)
y = self.c_proj(y)
return y
```

`y.contiguous()`是把内存变成连续的(fa返回的可能是非连续的)，view需要连续内存

## MLP

相当于encoder或者decoder的一个堆叠块

```python
class Block(nn.Module):
    def __init__(self, config: GPTConfig, layer_idx: int):
        super().__init__()
        self.attn = CausalSelfAttention(config, layer_idx)
        self.mlp = MLP(config)

    def forward(self, x, ve, cos_sin, window_size, kv_cache):
        x = x + self.attn(norm(x), ve, cos_sin, window_size, kv_cache)
        x = x + self.mlp(norm(x))
        return x
```

## GPT

### 元设备(Meta Device)

GPT 有很多参数，直接在 **init** 中初始化会很慢。我们可以在在**init**定义，然后再开一个函数初始化，init 阶段是虚拟结构，init_weights() 阶段是真实初始化：

| 阶段         | **init**                  | init_weights()                        |
| ------------ | ------------------------- | ------------------------------------- |
| **调用时机** | 创建模型时，自动调用      | 创建后，手动调用 model.init_weights() |
| **运行环境** | Meta Device（虚拟）       | 真实设备（GPU/CPU）                   |
| **内存占用** | **0字节**（没有真实数据） | **真实参数的内存**                    |
| **做什么**   | 定义网络结构              | 填充权重实际值                        |

词表大小会做一些调整, 向上取整到 pad_vocab_size_to 的倍数.

> 为什么要pad？为了DDP和tensor core效率

```python
padded_vocab_size = (
            (config.vocab_size + pad_vocab_size_to - 1) // pad_vocab_size_to
        ) * pad_vocab_size_to
```

相应的`lm_head`输出维度也是新的`padded_vocab_size`

```python
self.lm_head = nn.Linear(
            config.n_embd, padded_vocab_size, bias=False
        )
```

### \_precompute_rotary_embeddings

预计算出sin和cos的值，然后再apply_rotary_emb() 直接使用

### num_scaling_params

计算模型的总参数数量，用于缩放律分析

```python
nparams = sum(p.numel() for p in self.parameters())
return nparams
```

### setup_optimizers

这是作者在nanochat中多次实验调优出来的最佳实践，根据不同参数使用不同的优化器和学习率.这个属实是前沿大厂训练模型的不传之秘了，感恩开源

| 参数类型                 | 优化器   | 学习率 | 原因                      |
| ------------------------ | -------- | ------ | ------------------------- |
| **矩阵权重** (768×768等) | **Muon** | 0.02   | Muon对大矩阵效果好        |
| **Embedding**            | AdamW    | 0.2    | 词嵌入需要大学习率        |
| **Value Embedding**      | AdamW    | 0.2    | 同embedding               |
| **lm_head**              | AdamW    | 0.004  | 输出层需要小学习率        |
| **resid_lambdas**        | AdamW    | 0.005  | **最敏感！** (0.5 × 0.01) |
| **x0_lambdas**           | AdamW    | 0.5    | 较敏感                    |

- 学习率缩放：作者在768维模型上调参，大模型需要更小的lr，小模型需要更大的lr。
- resid_lambdas 超敏感：这个参数会在每一层都被乘一次，累积效应大

两个优化器：

- AdamW：适合embedding和小参数，自适应学习率
- Muon：专为大矩阵设计，在Transformer矩阵上特别有效

### forward

先把token id序列转成向量.x0是后面用于skip connection

```python
x = self.transformer.wte(idx)  # Token ID → Embedding向量
x = norm(x)
x0 = x
```

然后计算堆叠的Transformer Block

```python
for i, block in enumerate(self.transformer.h):
    # 第i层的残差混合
    x = self.resid_lambdas[i] * x + self.x0_lambdas[i] * x0
    # 可选：加入Value Embedding增强（某些层）
    ve = self.value_embeds[str(i)](idx) if str(i) in self.value_embeds else None
    # 通过该层的Attention + FFN
    x = block(x, ve, cos_sin, self.window_sizes[i], kv_cache)
x = norm(x)
```

接下来就可以得到logits，先用self.lm_head(x) 线性层把隐藏状态映射到词汇表大小的logits(这里实际上是被pad过的词汇表大小),然后切掉多余的，删回原始大小，最后转成float32，压缩logits范围到 `[-15, 15]`

```python
softcap = 15  # smoothly cap the logits to the range [-softcap, softcap]
logits = self.lm_head(
    x
)  # (B, T, padded_vocab_size) <- very big tensor, large amount of memory
logits = logits[..., : self.config.vocab_size]
logits = (
    logits.float()
)
logits = softcap * torch.tanh(logits / softcap)
```

最后根据训练还是推理返回不同的内容

- 训练时返回损失
- 推理时返回所有T个位置的logits (B, T, vocab_size)

```python
if targets is not None:
    # training: given the targets, compute and return the loss
    # TODO experiment with chunked cross-entropy?
    loss = F.cross_entropy(
        logits.view(-1, logits.size(-1)),
        targets.view(-1),
        ignore_index=-1,
        reduction=loss_reduction,
    )
    return loss
else:
    # inference: just return the logits directly
    return logits
```

### generate

#### top_k

Top-K采样：用 -∞ 来"屏蔽"低概率 token，只从高概率的 top_k 个里采样。

```python
if top_k is not None:
    v, _ = torch.topk(
        logits, min(top_k, logits.size(-1))
    )  # v: (B, top_k)
    logits[logits < v[:, [-1]]] = -float(
        "Inf"
    )
```

#### temperature

采样出token,然后拼接到输入序列，转成普通的 Python int，继续下一个位置的预测

1. 用温度调整 logits
   - temperature < 1: logits 被放大 → 分布更尖锐 → 采样更确定
   - temperature = 1: 不变
   - temperature > 1: logits 被缩小 → 分布更平坦 → 采样更随机
2. softmax 转成概率分布,所有值都在 `[0, 1]`，求和为 1
3. 按照这个概率分布采样，从分布中随机抽一个token ID

```python
if temperature > 0:
    logits = logits / temperature
    probs = F.softmax(logits, dim=-1)
    # shape: (B, vocab_size)
    next_ids = torch.multinomial(probs, num_samples=1, generator=rng)
```

#### 贪婪采样

给出概率最高的 token ID

## 总结

### GPT 中 norm 的位置？什么时候需要norm？

| 位置             | 代码                 | 作用                           |
| ---------------- | -------------------- | ------------------------------ |
| **Pre-Norm**     | `norm(x)` → Attn/FFN | 稳定梯度，允许高学习率         |
| **QK Norm**      | Q/K 后 Attention 前  | 稳定 attention scores 数值范围 |
| **Embedding 后** | `wte()` → `norm()`   | 标准化初始表示                 |
| **输出前**       | 最后 norm()          | 标准化最终表示                 |
