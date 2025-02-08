---
title: Venn-Abers 预测器
banner_img: https://cdn.studyinglover.com/pic/2023/12/334c0c129076533308cbc7e03f8c55be.png
date: 2024-1-15 19:40:00
tags:
- 机器学习
---

# Venn-Abers 预测器

Venn-Abers 预测器 https://arxiv.org/pdf/1211.0025.pdf

是一种基于Venn预测器的新的专注于二元预测问题的统计方法。它们生成的是概率类型的预测，这些预测在标准假设下（即观察是从同一分布独立生成的）是很好校准的。这种预测器的一个关键特点是它们输出的是概率区间而不是单一的概率点。Venn-Abers 预测器可以与其他模型结合使用。

Venn-Abers 预测器 输出的分数映射到经过良好校准的概率。



- **输入（Input）**
   - 数据特征（Data Features）: 模型抽出来的特征
   - 目标变量（Target Variable): 监督学习的目标

- **输出（Output）**
   - 概率预测（Probability Predictions）: Venn-Abers预测器输出的是概率对，而不是单一的概率值。这意味着对于每个预测实例，它会给出一个概率范围，而不是一个具体的概率点。
   - 校准质量评估（Calibration Quality Assessment）: 此外，还可以通过预期校准误差（ECE）等指标来评估预测的校准质量，这有助于理解模型在不同类别上的预测准确度。

have a try https://github.com/ptocca/VennABERS

```python
calibrPts = [(1,1,2),(2,2,4),(3,3,0),(4,4,2),(5,5,1),(6,6,5),(7,7,7)]
testScores = [1.5,2.5,3.5,4.5,5.5,6.5]

p0,p1 = ScoresToMultiProbs(calibrPts,testScores)
print(p0, p1)
```

```
[0.5        1.         1.66666667 2.33333333 3.         3.75      ] [1. 1. 1. 1. 1. 1.]
```

两个列表分别代表对应的代表上限和下限。