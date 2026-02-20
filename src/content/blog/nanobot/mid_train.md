---
title: nanobot-mid-train
description: ''
pubDate: '2026-1-18'
tags: ['nanobot', 'mid_train']
slug: 'nanobot/mid_train'
---

任务相关数据（但仍是next-token prediction）,学习数学、选择题、对话等"局部模式"

> 举个例子:
>
> Base Model看过: `"What is the capital of France?"`
>
> Mid-Train后: `"What is the capital of France? The capital of France is Paris."`（看了大量MMLU/GSM8K问&答对）
>
> SFT后: `[user_start] What is the capital of France? [user_end][assistant_start]The capital of France is Paris.[assistant_end]"`（学会了对话格式和停止）

具体的训练数据848K rows = 460K + 100K + 8K + 200K + 80K

```python
train_dataset = TaskMixture([
    SmolTalk(split="train"), # 460K rows of general conversations
    MMLU(subset="auxiliary_train", split="train"), # 100K rows of multiple choice problems drawn from ARC, MC_TEST, OBQA, RACE
    GSM8K(subset="main", split="train"), # 8K rows teaching simple math and (calculator) tool use
    CustomJSON(filepath=identity_conversations_filepath), # 1000 rows of synthetic identity conversations
    CustomJSON(filepath=identity_conversations_filepath), # let's do 2 epochs of these
    SimpleSpelling(size=200000, split="train"), # 200K rows of Simple Spelling (e.g. spell the word 'apple')
    SpellingBee(size=80000, split="train"), # 80K rows of Spelling Bee (e.g. how many 'r' are in 'strawberry'?)
])
```
