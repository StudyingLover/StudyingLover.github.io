---
title: ControlNet代码改造计划
banner_img: https://drive.studyinglover.com/api/raw/?path=/photos/blog/background/1679397024795.jpeg
date: 2023-4-21 11:30:00
tags:
- 图像生成
---
虽然现在webui已经支持了ControlNet，但是如果我们需要单独抽出来ControlNet做一些项目就需要对ControlNet进行改造。

## 下载源码和模型

项目主页
[github](https://github.com/lllyasviel/ControlNet)
[huggingface](https://huggingface.co/lllyasviel/ControlNet)

先下载源码
```bash
git clone https://github.com/lllyasviel/ControlNet.git 
```

接下来下载需要的模型，进入huggingface 页面，选择`files and versions` 
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230421105906.png)

先下载所有的annotator,进入`annotator/ckpts`文件夹,可以看到我们需要的ckpts文件，进入一个，右键download，选择复制下载链接
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230421110144.png)

执行命令，就会将模型下载下来
```bash
wget 复制的链接
```

我这里整理了ckpt文件所有的下载的链接和命令,`/root/ControlNet/annotator/ckpts/` 是我的路径，换成你自己的就行
```bash
cd /root/ControlNet/annotator/ckpts/

wget https://huggingface.co/lllyasviel/ControlNet/resolve/main/annotator/ckpts/body_pose_model.pth

wget https://huggingface.co/lllyasviel/ControlNet/resolve/main/annotator/ckpts/dpt_hybrid-midas-501f0c75.pt

wget https://huggingface.co/lllyasviel/ControlNet/resolve/main/annotator/ckpts/hand_pose_model.depth 

wget https://huggingface.co/lllyasviel/ControlNet/resolve/main/annotator/ckpts/mlsd_large_512_fp32.depth 

wget https://huggingface.co/lllyasviel/ControlNet/resolve/main/annotator/ckpts/mlsd_tiny_512_fp32.depth 

wget https://huggingface.co/lllyasviel/ControlNet/resolve/main/annotator/ckpts/network-bsds500.depth 

wget https://huggingface.co/lllyasviel/ControlNet/resolve/main/annotator/ckpts/upernet_global_small.pth
```

接下来下载模型，假如我们需要canny2image，那我就需要下载`control_sd15_canny.pth` 这个文件，类似上面的方法，命令是
```bash
wget https://huggingface.co/lllyasviel/ControlNet/resolve/main/models/control_sd15_canny.pth
```

> 其实我们可以对比网址链接和下载链接 
> 
> 网址链接：https://huggingface.co/lllyasviel/ControlNet/blob/main/models/control_sd15_canny.pth 
> 
> 下载链接：https://huggingface.co/lllyasviel/ControlNet/resolve/main/models/control_sd15_canny.pth 
> 
> 我们只需要把网址链接的blob换成resolve就可以了。

## 改造
我们依然以camny2image为例，打开`gradio_canny2image,py` 文件，可以看到这个文件大概是这个样子
```python 
import 各种依赖

apply_canny = CannyDetector()# 创建了一个canny算子，用来将图片转换成canny图

model = create_model('./models/cldm_v15.yaml').cpu()
model.load_state_dict(load_state_dict('./models/control_sd15_canny.pth', location='cuda'))
model = model.cuda()
ddim_sampler = DDIMSampler(model)# 加载了模型

def process(input_image, prompt, a_prompt, n_prompt, num_samples, image_resolution, ddim_steps, guess_mode, strength, scale, seed, eta, low_threshold, high_threshold):
    # 一堆操作
    return [255 - detected_map] + results# 返回了canny图和生成的图片

block = gr.Blocks().queue()# 创建一个gradio应用
with block:
	# 又是一通操作，创建了各种gradio页面

block.launch(server_name='0.0.0.0')# 启动了gradio应用
```

这样子我们只需要`process` 这个函数就可以了，那我们就可以把代码改成这样
```python 
from share import *
import config
import cv2
import einops
import gradio as gr
import numpy as np
import torch
import random

from pytorch_lightning import seed_everything
from annotator.util import resize_image, HWC3
from annotator.canny import CannyDetector
from cldm.model import create_model, load_state_dict
from cldm.ddim_hacked import DDIMSampler

apply_canny = CannyDetector()
  
model = create_model('./models/cldm_v15.yaml').cpu()

model.load_state_dict(load_state_dict('./models/control_sd15_canny.pth', location='cuda'))
model = model.cuda()
ddim_sampler = DDIMSampler(model)

def process(input_image, prompt, a_prompt, n_prompt, num_samples, image_resolution, ddim_steps, guess_mode, strength, scale, seed, eta, low_threshold, high_threshold):
	# 这块直接复制源码process函数
    return [255 - detected_map] + results


if '__main__' == __name__:
    img=cv2.imread('test.png')# 写你的图片路径
    prompt='1girl,beautiful background,beautiful face,beazutiful clothes'# prompt
    a_prompt='best quality, extremely detailed' # 额外的prompt，例如best quality, extremely detailed这样的
    n_prompt='longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality' # negative prompt反向promote
    num_samples=1# 生成几张图
    image_resolution=512# 图片分辨率
    ddim_steps=30# DDIP采样次数
    guess_mode=False
    strength=1.0
    scale=9.0
    seed=-1
    eta=0.0
    low_threshold=100
    high_threshold=200

    out=process(img, prompt, a_prompt, n_prompt, num_samples, image_resolution, ddim_steps, guess_mode, strength, scale, seed, eta, low_threshold, high_threshold)

    cv2.imwrite('out.png',out[1])# 保存生成的图像
    cv2.imwrite('canny.png',out[0])# 保存canny图
```


