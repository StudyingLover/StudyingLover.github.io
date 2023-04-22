---
title: ControlNet代码改造计划
banner_img: https://drive.studyinglover.com/api/raw/?path=/photos/blog/background/1679397024795.jpeg
date: 2023-4-21 11:30:00
tags:
- 图像生成
---
虽然现在webui已经支持了ControlNet，但是如果我们需要单独抽出来ControlNet做一些项目就需要对ControlNet进行改造。同时我也想加入一些开源的工具让ControlNet更加有趣，例如[clip_interrogator](https://github.com/pharmapsychotic/clip-interrogator).

关于什么是Canny，Hough，可以看北邮鲁鹏老师的课程[计算机视觉（本科）北京邮电大学 鲁鹏](https://www.bilibili.com/video/BV1nz4y197Qv/?spm_id_from=333.999.0.0&vd_source=e8f062c423dc7ce759a573dd732735a0)

如果你想在webui使用ControlNet，可以看我之前的[文章](https://studyinglover.com/2023/03/20/%E9%80%9A%E8%BF%87colab%E4%BD%93%E9%AA%8CControlNet/)  ，或者直接查看[webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui)  

项目开源在[GitHub](https://github.com/StudyingLover/cmd_ControlNet)

我的博客[https://studyinglover.com](https://studyinglover.com/2023/04/21/ControlNet%E4%BB%A3%E7%A0%81%E6%94%B9%E9%80%A0/)

## 下载源码和模型

ControlNet项目主页

[github](https://github.com/lllyasviel/ControlNet) ,
[huggingface](https://huggingface.co/lllyasviel/ControlNet)

先下载源码
```bash
git clone https://github.com/lllyasviel/ControlNet.git 
```

接下来下载需要的模型，进入huggingface 页面，选择`files and versions` 
![image.png](https://proxy.thisis.plus/20230421105906.png)

先下载所有的annotator,进入`annotator/ckpts`文件夹,可以看到我们需要的ckpts文件，进入一个，右键download，选择复制下载链接
![image.png](https://proxy.thisis.plus/20230421110144.png)

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
    parser = argparse.ArgumentParser()
    parser.add_argument('--image_path', type=str, default='test.png', help='original image path')
    parser.add_argument('--prompt', type=str, default='1people', help='prompt')
    parser.add_argument('--a_prompt', type=str, default='best quality, extremely detailed', help='added prompt')
    parser.add_argument('--n_prompt', type=str, default='longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality', help='negative prompt')
    parser.add_argument('--num_samples', type=int, default=1, help='number of samples')
    parser.add_argument('--image_resolution', type=int, default=512, help='image resolution')
    parser.add_argument('--ddim_steps', type=int, default=30, help='ddim steps')
    parser.add_argument('--is_saved', type=bool, default=True, help='is saved?')
    parser.add_argument('--is_show', type=bool, default=False, help='is show?')
    parser.add_argument('--guess_mode', type=bool, default=False, help='guess mode')
    parser.add_argument('--strength', type=float, default=1.0, help='strength')
    parser.add_argument('--scale', type=float, default=9.0, help='scale')
    parser.add_argument('--seed', type=int, default=-1, help='seed')
    parser.add_argument('--eta', type=float, default=0.0, help='eta')
    parser.add_argument('--low_threshold', type=int, default=100, help='low threshold')
    parser.add_argument('--high_threshold', type=int, default=200, help='high threshold')
  

    opt = parser.parse_args()
    
    img=cv2.imread(opt.image_path)
    out=process(img, opt.prompt, opt.a_prompt, opt.n_prompt, opt.num_samples, opt.image_resolution, opt.ddim_steps, opt.guess_mode, opt.strength, opt.scale, opt.seed, opt.eta, opt.low_threshold, opt.high_threshold)

    if(opt.is_show):
        cv2.imshow('out',out[1])
    if(opt.is_saved):
        cv2.imwrite('out.png',out[1])
        print('saved to out.png')
```

用法就是parser的用法，例如
```bash
python cmd_canny2image.py --image_path ./test_imgs/main.png --prompt bule_hair,color_clothes 
```
输出的图片会被保存到当前目录下的out.png文件

## clip_interrogator
你可以在[huggingface](https://huggingface.co/spaces/fffiloni/CLIP-Interrogator-2) 直接体验，这里是代码调用相应接口。

先下载 clip_interrogator
```bash
pip install clip-interrogator==0.5.4
```

接下来调用 clip_interrogator
```python
from clip_interrogator import Config, Interrogator
import cv2 as cv
from PIL import Image

img=cv.imread('/content/src/test.png')
img = cv.cvtColor(img,cv.COLOR_BGR2RGB)
img = Image.fromarray(img)

ci = Interrogator(Config(clip_model_name="ViT-L-14/openai"))

describe=ci.interrogate(img)
print('\n'+describe)
```

我们将他封装成函数
```python
def app(numpy_img):
    img = cv.cvtColor(numpy_img,cv.COLOR_BGR2RGB)
    img = Image.fromarray(img)
    ci = Interrogator(Config(clip_model_name="ViT-L-14/openai"))
    describe=ci.interrogate(img)
    return describe
```

在 [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/StudyingLover/cmd_ControlNet/blob/master/fix_ControlNet_and_CLIPinterrogator.ipynb) 可以体验 ControlNet和CLIPinterrogator 混合使用，两张图片都从url引入，一张图获取prompt，ptompt和另一张图一起输入输入canny2image，生成的图片展示在输出框底部