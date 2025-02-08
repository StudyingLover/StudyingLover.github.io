---
title: m2cgen生成机器学习c语言推理代码
banner_img: https://cdn.studyinglover.com/pic/2023/07/b5c4ecf9aa476ca1073f99b22fe9605e.jpg
date: 2023-9-7 15:48:00
categories:
- 踩坑
tags:
- 机器学习
---
# m2cgen生成机器学习c语言推理代码
众所周知，cubemx是一个用于生成嵌入式的代码的好东西虽然我没用过。它的原理是将原本的矩阵运算和tensor变成了一个c的数组，同时会对代码进行优化，然后进行运算。

但是如果我们需要在其他平台上使用其他语言就很尴尬了，因为我们没有cubemx来做生成和优化。感谢蓬勃发展的社区，[m2cgen](https://github.com/BayesWitnesses/m2cgen)解决了我们的问题。

使用起来非常简单，我们使用xgboost举例，先训练一个xgboost模型
```python
from sklearn.datasets import load_diabetes
from sklearn import linear_model

X, y = load_diabetes(return_X_y=True)

estimator = linear_model.LinearRegression()
estimator.fit(X, y)
```

然后导出c代码
```python
import m2cgen as m2c
code = m2c.export_to_c(estimator)
with open ('model.c', 'w') as f:
   f.write(code)
```

我们可以看到导出的代码已经是纯c语言的代码了，是以一个函数保存的
```c
double score(double * input) {
    return 152.13348416289597 + input[0] * -10.009866299810508 + input[1] * -239.81564367242302 + input[2] * 519.845920054461 + input[3] * 324.38464550232334 + input[4] * -792.1756385522302 + input[5] * 476.73902100525737 + input[6] * 101.04326793803405 + input[7] * 177.06323767134606 + input[8] * 751.2736995571034 + input[9] * 67.62669218370456;
}
```

如果你遇到了这样的一个错误
```bash
base_score = -math.log(1.0 / self._base_score - 1.0)
                           ~~~~^~~~~~~~~~~~~~~~~~
TypeError: unsupported operand type(s) for /: 'float' and 'NoneType'
```
这是由于xgboost模型字段发生变化导致的，在`m2c.export_to_c`之前加入`model.base_score = 0` 就行
```python
import m2cgen as m2c
model.base_score = 0
code = m2c.export_to_c(estimator)
with open ('model.c', 'w') as f:
   f.write(code)
```

