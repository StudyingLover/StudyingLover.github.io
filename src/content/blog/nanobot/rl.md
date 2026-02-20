---
title: nanobot-rl
description: ''
pubDate: '2026-1-18'
tags: ['nanobot', 'rl', 'reinforcement learning']
slug: 'nanobot/rl'
---

这里没有使用GRPO，而是使用了简化版的GRPO，更接近REINFORCE

| 特性                  | REINFORCE | GRPO (标准)            | GRPO (简化版，这里用的) |
| --------------------- | --------- | ---------------------- | ----------------------- |
| **Policy Gradient**   | ✅        | ✅                     | ✅                      |
| **KL Divergence约束** | ❌        | ✅ (有reference model) | ❌ 删除了               |
| **PPO Clip**          | ❌        | ✅ (importance ratio)  | ❌                      |
| **On/Off Policy**     | On        | Off                    | On                      |
| **Advantage计算**     | 基础      | z-score                | 仅减均值                |

和标准的GRPO相比

- 保留了
  - 分组采样：对每个 GSM8K 问题，生成 num_samples 个回答（默认为16），确实是 group-based。
  - 相对优势，但只减均值，不除方差
  - 无 Critic / 无 Value Model：这里完全没有价值网络。
- 去除了
  - 没有 std 归一化：GRPO 公式中的 `(r - mean)/std` 在这里被简化成 `(r - mean)`。
  - 没有 KL 正则 / 没有参考模型：代码没有 `KL(π_new || π_ref)`，也没有 trust region。
  - 没有 PPO ratio + clip：没有 min(ratio _ A, clip(ratio) _ A)，直接用 logprob \* advantage。
  - On-policy：不做 importance sampling（没有 ratio），直接对当前策略的样本做 PG。
- 奖励函数
  和 R1-Zero 规则奖励的对比
  - 这里的奖励来自 `GSM8K.reward(...)`，本质是“答案对/错”的规则奖励；没有单独的“格式奖励” (<think></think> 之类)。
  - 也没有训练 Reward Model，直接规则打分（推理即可）。
- 优化目标
  实际用的目标：`loss = - (logp * (r - mean)).sum_normalized`。 没有 KL、没有 std 归一化、没有 PPO clip。

## 经验

不会了，直接贴ai写的

- **整体范式**：这是“带分组、均值基线的 on-policy REINFORCE”，不是全功能 GRPO/PPO。没有 KL 正则、没有 ratio/clip、没有 reference/critic，只用 (r - mean) 当 advantage。
- **数据流**：每道 GSM8K 题 -> 生成 num_samples 条回答 -> 规则 reward（对/错） -> 组内均值做基线 -> 计算 advantage。
- **目标函数**：
  - inputs/targets 对齐 `[ :-1 ]/[ 1: ]`，mask==0 的目标被置 -1 忽略。
  - `logp = -model(inputs, targets, loss_reduction='none')`
  - `pg_obj = (logp * advantages[:, None]).sum() / (有效token数 * num_passes * examples_per_rank)`
  - `loss = -pg_obj`（最大化期望回报）。
- **分组与采样**：group sampling 体现 GRPO 风味，但 advantage 只减均值、不做 /std；on-policy，无 importance ratio。
- **奖励设计**：规则打分（answer correctness），无格式奖励、无训练 RM，方差相对可控。
- **终止与mask**：Engine 生成时 prompt 和强制 tokens 的 mask=0，不计入 loss；padding 用 <|assistant_end|>，同样 mask 0。
- **调度与批次**：`examples_per_step` 跨 GPU 平分，可能多 pass 堆叠到 `device_batch_size`；LR 线性衰减到 0。
- **评估指标**：周期性 pass@k（基于采样正确率），监控 mean_reward / mean_sequence_length。
- **缺失的经典部件**：无 KL、无 reference model、无 std 归一、无 PPO clip，显存占用低但梯度方差可能更大。
