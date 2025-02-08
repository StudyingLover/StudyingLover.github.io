---
title: Archlinux使用CMake调用xgboost的c接口
banner_img: https://cdn.studyinglover.com/pic/2023/07/b5c4ecf9aa476ca1073f99b22fe9605e.jpg
date: 2023-9-9 20:53:00
categories:
- 踩坑
tags:
- 机器学习
---
# Archlinux使用CMake调用xgboost的c接口

平台Archlinux,直接`yay` 安装xgboost,相关的.h文件会被直接安装到`/usr/include/xgboost` 路径下，所有在`CMakeLists.txt` 设置`include_directories` 到该路径下即可。

```CMakeLists.txt
cmake_minimum_required(VERSION 3.18)
project(project_name LANGUAGES C CXX VERSION 0.1)
set(xgboost_DIR "/usr/include/xgboost")

include_directories(${xgboost_DIR})
link_directories(${xgboost_DIR})

add_executable(project_name test.c)
target_link_libraries(project_name xgboost)
```

在c文件中直接调用头文件
```c
#include "xgboost/c_api.h"
```

编译使用cmake
```
mkdir build
cd ./build
cmake ..
make 
./project_name
```
