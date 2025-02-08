---
title: 使用xgboost的c接口推理模型
banner_img: https://cdn.studyinglover.com/pic/2023/07/b5c4ecf9aa476ca1073f99b22fe9605e.jpg
date: 2023-9-10 21:10:00
categories:
- 踩坑
tags:
- 机器学习
---
# 使用xgboost的c接口推理模型
官方[c api tutorial](https://xgboost.readthedocs.io/en/stable/tutorials/c_api_tutorial.html)和[文档](https://xgboost.readthedocs.io/en/stable/c.html)，非常恶心的一点是，tutorial和文档问题很多。

也参考了不少开源项目，主要有[xgboost-c-cplusplus](https://github.com/R-Stalker/xgboost-c-cplusplus),[xgboostpp](https://github.com/EmbolismSoil/xgboostpp).

首先导入头文件`#include "xgboost/c_api.h"` ，接下来xgboost的绝大多数接口都包含在了这个头文件中。

然后我们需要一个宏，来用它获取xgboost函数使用的情况.在每次调用xgboost函数时都应该调用这个宏。
```c
#define safe_xgboost(call) {  \
  int err = (call); \
  if (err != 0) { \
    fprintf(stderr, "%s:%d: error in %s: %s\n", __FILE__, __LINE__, #call, XGBGetLastError());  \
    exit(1); \
  } \
}
```

我们使用的模型文件为`xgboost_model.bin` ,训练数据的输入是 **11** 个元素。

首先我们声明一个boost模型的句柄`BoosterHandle booster;` 接着用`XGBoosterCreate` 函数创建一个模型 。
```c
BoosterHandle booster;
safe_xgboost(XGBoosterCreate(NULL, 0, &booster));
```

设置一个字符串作为模型路径`const char *model_path = "../xgboost_model.bin";`(`../`是因为编译出来的可执行文件在build目录下) ， 通过句柄使用`XGBoosterLoadModel`函数加载模型。
```c
const char *model_path = "../xgboost_model.bin";
XGBoosterLoadModel(booster, model_path)
```

设置一组数据作为推理测试，这里我选的数据标签是1.接着将输入数据转为xgboost的DMatrix格式。
```c
float a[11]= {14.0,2.0,1.0,12.0,19010.0,120.0,14.0,0.0,0.0,0.0,0.0};
DMatrixHandle h_test;
safe_xgboost(XGDMatrixCreateFromMat(a, 1, 11, -1, &h_test));
```

下面就可以进行模型推理了，`out_len` 代表输出的长度(实际上是一个整型变量)，`f`的模型推理的结果。
```c
bst_ulong out_len;
const float *f;
safe_xgboost(XGBoosterPredict(booster, h_test, 0, 0, 1, &out_len, &f));
```

我们可以打印输出查看结果
```c
printf("Value of the variable: %f\n", f[0]);
```

最后记得释放内存
```c
XGDMatrixFree(h_test);
XGBoosterFree(booster);
```

完整的代码
```c
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include "xgboost/c_api.h"

#define safe_xgboost(call) {  \
  int err = (call); \
  if (err != 0) { \
    fprintf(stderr, "%s:%d: error in %s: %s\n", __FILE__, __LINE__, #call, XGBGetLastError());  \
    exit(1); \
  } \
}

int main(int argc, char const *argv[]) {
    const char *model_path = "../xgboost_model.bin";

    // create booster handle first
    BoosterHandle booster;
    safe_xgboost(XGBoosterCreate(NULL, 0, &booster));
    // load model
    safe_xgboost(XGBoosterLoadModel(booster, model_path));

    //generate random data of a a[11],every nuber from 0 to 2
    // float a[11]= {1.0,12.0,1.0,1.0,16134.0,20600.0,0.0,1.0,0.0,0.0,0.0}; // label: 0.0
    float a[11]= {14.0,2.0,1.0,12.0,19010.0,120.0,14.0,0.0,0.0,0.0,0.0}; // label: 1.0

    for (int i = 0; i < 11; i++) {
        printf("%f, ", a[i]);
        if (i == 10) {
            printf("\n");
        }
    }
    // convert to DMatrix
    DMatrixHandle h_test;
    safe_xgboost(XGDMatrixCreateFromMat(a, 1, 11, -1, &h_test));
    // predict
    bst_ulong out_len;
    const float *f;
    safe_xgboost(XGBoosterPredict(booster, h_test, 0, 0, 1, &out_len, &f));
    printf("Value of the variable: %f\n", f[0]);

    XGDMatrixFree(h_test);
    XGBoosterFree(booster);
    return 0;
}
```

使用cmake编译
```CMakeLists.txt
cmake_minimum_required(VERSION 3.18)
project(project_name LANGUAGES C CXX VERSION 0.1)
set(xgboost_DIR "/usr/include/xgboost")

include_directories(${xgboost_DIR})
link_directories(${xgboost_DIR})

add_executable(project_name test.c)
target_link_libraries(project_name xgboost)
```


```
mkdir build
cd ./build
cmake ..
make .
./project_name
```