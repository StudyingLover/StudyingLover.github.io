---
title: xgboost模型序列化存储并推理
banner_img: https://cdn.studyinglover.com/pic/2023/07/9482f9fe9617825162494635a1b7f460.jpg
date: 2023-9-7 15:03:00
categories:
- 踩坑
tags:
- 机器学习
---

# xgboost模型序列化存储并推理
参考了博客 https://github.com/apachecn/ml-mastery-zh/blob/master/docs/xgboost/save-gradient-boosting-models-xgboost-python.md ，但是修改了一些过时的部分。

我们在 [Pima 印第安人糖尿病数据集](https://archive.ics.uci.edu/ml/datasets/Pima+Indians+Diabetes) 上训练xgboost模型，训练数据集在[GitHub](https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv) 下载
```bash
wget https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv
```

## Pickle
Pickle是一个python序列化的标准方法。

先训练一个模型,然后将模型按照Pickle的形式存储，接下来读取模型并进行推理
```python
import random
from numpy import loadtxt
import xgboost
import pickle
from sklearn import model_selection
from sklearn.metrics import accuracy_score
from sklearn import model_selection as cross_validation
# load data
dataset = loadtxt('pima-indians-diabetes.data.csv', delimiter=",")
# split data into X and y
X = dataset[:,0:8]
Y = dataset[:,8]
# split data into train and test sets
seed = random.randint(1, 100)
test_size = 0.33

X_train, X_test, y_train, y_test = cross_validation.train_test_split(X, Y, test_size=test_size, random_state=seed)
# fit model no training data
model = xgboost.XGBClassifier()
model.fit(X_train, y_train)

# save model to file
pickle.dump(model, open("pima.pickle.dat", "wb"))

```

读取模型并推理
```python
# load model from file
loaded_model = pickle.load(open("pima.pickle.dat", "rb"))
# train model again
loaded_model.fit(X_train, y_train)

# make predictions for test data
y_pred = loaded_model.predict(X_test)
predictions = [round(value) for value in y_pred]
# evaluate predictions
accuracy = accuracy_score(y_test, predictions)
print("Accuracy: %.2f%%" % (accuracy * 100.0))
```

## joblib
Joblib 是一组在 Python 中提供**轻量级流水线**的工具，**joblib 在大型 numpy 数组上通常要快得多**

用法实际上和pickle基本相同。
```python
# Train XGBoost model, save to file using joblib, load and make predictions
import random
from numpy import loadtxt
import xgboost
import joblib
from sklearn import model_selection
from sklearn.metrics import accuracy_score
from sklearn import model_selection as cross_validation
# load data
dataset = loadtxt('pima-indians-diabetes.data.csv', delimiter=",")
# split data into X and y
X = dataset[:,0:8]
Y = dataset[:,8]
# split data into train and test sets
seed = random.randint(1, 100)
test_size = 0.33
X_train, X_test, y_train, y_test = cross_validation.train_test_split(X, Y, test_size=test_size, random_state=seed)
# fit model no training data
model = xgboost.XGBClassifier()
model.fit(X_train, y_train)
# save model to file
joblib.dump(model, "pima.joblib.dat")

```

读取模型并推理

```python
# load model from file
loaded_model = joblib.load("pima.joblib.dat")
# make predictions for test data
y_pred = loaded_model.predict(X_test)
predictions = [round(value) for value in y_pred]
# evaluate predictions
accuracy = accuracy_score(y_test, predictions)
print("Accuracy: %.2f%%" % (accuracy * 100.0))

```
