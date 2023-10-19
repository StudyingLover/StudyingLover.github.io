---
title: xgboost2.0最佳实践
banner_img: https://cdn.studyinglover.com/pic/2023/10/faf4c4a867b04fc7cc77110926bf2d43.png
date: 2023-10-19 8:30:00
categories:
- 踩坑
tags:
- 机器学习
---
# xgboost2.0最佳实践
首先更新xgboost到2.0.0
```bash
pip install xgboost -U 
```

在最新版本的训练中，参数可以使用字典传递。同时数据和样本需要先合并成一个`xgb.DMatrix` 对象
```python
# 设置参数
params = {
    "device": "cuda",
}

# 创建DMatrix对象
Xy = xgb.DMatrix(X_train, y_train)

# 训练模型
model = xgb.train(params, Xy)
```

进行分类任务是，需要传递类别数，而不是像之前版本那样自动检测类别
```python
# 设置参数
params = {
    "device": "cuda",
    "num_class": 5
}
```

根据xgboost路线图[Roadmap Phasing out the support for old binary format.](https://github.com/dmlc/xgboost/issues/7547)，在2.2版本将删除对保存旧二进制格式的支持，删除对旧 JSON 模型的支持。在2.3版本将删除对加载旧二进制格式的支持。最新保存模型的方式是
```python
xgb.save(bst, 'model_file_name.json')
```
