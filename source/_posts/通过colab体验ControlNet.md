---
title: 通过colab体验ControlNet
banner_img: https://i.imgtg.com/2023/01/29/S2miD.jpg
date: 2023-3-20 15:50:00
tags:
- 图像生成
---
# 通过colab体验ControlNet
## 跑通流程

首先，我们要会xxxx并且有一个Google账号。这是一句废话。

### 启动webui
访问[https://colab.research.google.com/](https://colab.research.google.com/) 然后登陆自己的谷歌账号，

然后访问[https://github.com/camenduru/stable-diffusion-webui-colab](https://github.com/camenduru/stable-diffusion-webui-colab)

![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230324163856.png)

可以看到这里有很多的colab可以使用。

>`lite` has a stable WebUI and stable installed extensions. 
>`stable` has ControlNet, a stable WebUI, and stable installed extensions.  
>`nightly` has ControlNet, the latest WebUI, and daily installed extension updates

为了稳定的使用并且能使用ControlNet,这里我们使用*stable* 版本，我选了第一个如下图
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230324164312.png)


点击进入后我们就能看到这样的界面了
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230320150108.png)


如图，点击我画出来的，运行这个notebook。经过一番耐心的等待，你在控制台的最下面会看到这么几行![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230324164418.png)

点击最下面的两个链接中的任意一个，会跳转到webui的页面，我们主要用到的是`text2img`和`img2img`. 

我们以`text2img`为例，这里只说常用的功能，如图所示。

这里的prompt就是提示词，假如你想让他画一只猫猫，你就在prompt的位置写上`cat`,negative prompt就是说排除掉那些词语，例如我们不想要红色的猫猫，我们可以写`red_cat`
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230320151053.png)

这里需要解释一堆东西

1. Sampling method适用于生成图像的算法
2. Restore faces是使用GFPGAN来修复人脸 
3. Tiling生成一张可以平铺的图片
4. Hires. fix 用两阶段的方法生成图像，先生成一张低分辨率的图片，然后在不改变构图的情况下继续优化细节
5. Batch count 生成多少个批次(注意显存) 
6. Batch size 一个批次生成多少张图片(注意显存) 
7. CFG Scale 这个值和图片引导与图片相关程度挂钩，值越低图片越有创意

### 启用ControlNet
滑到最下面，打开ControlNet功能(可能布局有所不同)
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230320151223.png)

打开之后如图
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230320151404.png)
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230320151648.png)

如果你想先看一下controlnet会按照什么来绘画，你可以通过创建画布下面的Preview来查看。

这里推荐一个网站[https://prompthero.com/search?model=Stable+Diffusion&q=video+game+concept+art&source=f7591caf953](https://prompthero.com/search?model=Stable+Diffusion&q=video+game+concept+art&source=f7591caf953) ,里面有各种各样的prompt，也是游戏风格的。

我们随便选一个prompt来生成一张图
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230320153127.png)

我们可以把图片放到`img2img`继续体验，使用方法和`text2img`基本一样。

## Q&A
### posex
在新版本的stable diffusion webui中你会发现这个插件
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230324173639.png)

这是一个open pose编辑器，你可以在这里编辑openpose，然后把编辑好的图片发给ControlNet

### Additional Networks 
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230324174228.png)

一般在ControlNet上面，这个的作用的加入一些自己找的模型。

### ControlNet概念

#### 模型

在作者的[论文](https://arxiv.org/abs/2302.05543)和[GitHub仓库](https://github.com/lllyasviel/ControlNet)和论文详细的写了各种模型是什么样子的(累了，偷个懒，有需要再写)


#### 预处理器
处理图片的一种方式，个人认为和传统图像处理的那些方法是一致的，处理的结合和上面作者的论文[arxiv](https://arxiv.org/abs/2302.05543)和[GitHub仓库](https://github.com/lllyasviel/ControlNet)中式一样的

