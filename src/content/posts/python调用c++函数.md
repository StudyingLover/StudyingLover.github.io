---
title: python调用c++函数
banner_img: https://proxy.thisis.plus/202306281933716.png
date: 2023-7-15 9:30:00
categories:
- 踩坑
---
# python调用c++函数
当我们需要在Python中使用C++编写的函数时，可以将C++代码编译成共享库文件（.so文件），然后来调用这些函数。这里介绍两种方法。

## 使用python的api
首先要安装安装`python-dev` 和`cmake`

在Archlinux下`yay python-dev` ，`yay cmake`即可。其他平台需要自行搜索

首先创建一个C++文件 `main.cpp`
```cpp
#include <Python.h>
  
int add(int a, int b) {
	return a + b;
}
  
static PyObject* py_add(PyObject* self, PyObject* args) {
	int a, b;
	if (!PyArg_ParseTuple(args, "ii", &a, &b)) {
		return NULL;
	}
	int result = add(a, b);
	return PyLong_FromLong(result);
}
  
static PyMethodDef module_methods[] = {
	{"add", py_add, METH_VARARGS, "Add two integers."},
	{NULL, NULL, 0, NULL}
};
  
static struct PyModuleDef module_def = {
	PyModuleDef_HEAD_INIT,
	"my_module",
	"My custom module.",
	-1,
	module_methods
};
  
PyMODINIT_FUNC PyInit_my_module(void) {
	return PyModule_Create(&module_def);
}
```

接着用cmake构建`.so`文件，`CMakeLists.txt` 内容如下
```CMakeLists
cmake_minimum_required(VERSION 3.0)
  
project(my_module)
  
find_package(Python REQUIRED COMPONENTS Interpreter Development)
  
add_library(my_module SHARED main.cpp)
  
target_include_directories(my_module PRIVATE ${Python_INCLUDE_DIRS})
target_link_libraries(my_module PRIVATE ${Python_LIBRARIES})
  
set_target_properties(my_module PROPERTIES PREFIX "")
set_target_properties(my_module PROPERTIES SUFFIX ".so")
```

构建完成后会有一个名为`my_module.so` 的文件

接下来使用python调用,注意将python文件和`my_module.so` 放到同一个目录下
```python
import my_module
  
result = my_module.add(1, 2)
print(result)
```

## 按照 C 语言的规则来编译和链接
首先，我们需要编写一个C++文件`mylib.cpp`
```cpp
extern "C" int add(int a, int b) {
    return a + b;
}
```


接下来，编译`mylib.cpp` 为一个`.so`文件
```bash
g++ -shared -o mylib.so -fPIC mylib.cpp
```


最后使用python加载`mylib.so` 文件并调用
```python
import ctypes

# 加载共享库文件
mylib = ctypes.cdll.LoadLibrary('./mylib.so')

result = mylib.add(1, 2)
print(result)
```
