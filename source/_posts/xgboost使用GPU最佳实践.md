---
title: FreeU-文字生成图片的免费午餐笔记
banner_img: https://cdn.studyinglover.com/pic/2023/10/faf4c4a867b04fc7cc77110926bf2d43.png
date: 2023-10-18 18:50:00
categories:
- 踩坑
tags:
- 机器学习
---
# xgboost使用GPU最佳实践

首先更新xgboost到2.0.0
```bash
pip install xgboost -U 
```

这里给出一个使用GPU的例子，使用的是nvidia显卡
```python
import xgboost
import numpy as np
from scipy import stats

# 生成示例数据
np.random.seed(114514)
X = np.random.randn(100, 3)  # 生成100个样本，每个样本有3个特征
y = stats.bernoulli.rvs(0.5, size=100)  # 生成二分类标签，概率为0.5

# 设置参数
params = {
    "device": "cuda"
}

# 创建DMatrix对象
Xy = xgboost.DMatrix(X, y)

# 训练模型
model = xgboost.train(params, Xy)

# 测试模型
test_array = np.random.randn(1, 3)
dtest = xgboost.DMatrix(test_array)
pred = model.predict(dtest)
print(pred)
```
