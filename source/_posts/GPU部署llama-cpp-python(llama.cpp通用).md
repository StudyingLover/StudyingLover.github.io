---
title: GPU部署llama-cpp-python(llama.cpp通用)
banner_img: https://cdn.studyinglover.com/pic/2023/07/869e354fa5d2254251c10bc2e3cf1bef.png
date: 2023-8-6 23:01:00
tags:
- 踩坑
---
# GPU部署llama-cpp-python(llama.cpp通用)
## 通用流程
我们的安装平台是Ubuntu20.04，Python 3.8.10，cuda 11.6。

首先确保自己是否已经安装了cuda,输入
```bash
nvcc -V
```

有类似下面的输出即可
```
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2021 NVIDIA Corporation
Built on Fri_Dec_17_18:16:03_PST_2021
Cuda compilation tools, release 11.6, V11.6.55
Build cuda_11.6.r11.6/compiler.30794723_0
```

我们选用 `cuBLAS` 加速后端代理。直接按照下面命令安装
```bash
export LLAMA_CUBLAS=1
CMAKE_ARGS="-DLLAMA_CUBLAS=on" FORCE_CMAKE=1 pip install llama-cpp-python
```

不出意外的话就安装好了，但是你会出现很多意外，请你努力在一堆红色的报错中找出关键出错点，然后搜索，在最后我给出了几个我遇到的。

## 运行
运行和CPU直接运行相似，只是需要加入几个参数.
```bash
python3 -m llama_cpp.server --model llama-2-70b-chat.ggmlv3.q5_K_M.bin --n_threads 30 --n_gpu_layers 200
```

`n_threads` 是一个CPU也有的参数，代表最多使用多少线程。

`n_gpu_layers` 是一个GPU部署非常重要的一步，代表大语言模型有多少层在GPU运算，如果你的显存出现 `out of memory` 那就减小 `n_gpu_layers`

## 关于多卡
亲测多卡没有遇到什么大坑，只要`torch.cuda.is_available()` 和`torch.cuda.device_count()`正常就可以跑起来。

两张 Tesla T4 的卡推理70B大概半分钟就可以出结果。

## 报错解决
### Check for working CUDA compiler: /usr/local/cuda/bin/nvcc - skipped

参考 https://github.com/ggerganov/llama.cpp/issues/1832
系统安装过程中没找到你的cuda在哪里，所以在pip安装之前先设置一个环境变量,**把/usr/local/cuda-x.y改成你的cuda路径**
```bash
export CUDA_PATH=/usr/local/cuda-x.y
```
### 'f16c': expected a number
这是你的cuda版本太低了，升级到较新版本(11.6可用)。

或者参考 https://github.com/ggerganov/llama.cpp/issues/1467 和 https://github.com/marella/ctransformers/issues/53 中提到的命令和构建(我没有尝试，有谁试了可以请我结果)。

### Value 'sm_30' is not defined for option 'gpu-name' Tesla T
先运行下面的命令
```bash
apt-cache policy nvidia-cuda-toolkit
```
如果版本是**1.0** 那么请运行 `sudo apt remove nvidia-cuda-toolkit ` 

