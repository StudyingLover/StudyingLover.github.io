---
title: 通过colab体验ControlNet
banner_img: https://i.imgtg.com/2023/01/29/S2miD.jpg
date: 2023-3-20 15:50:00
tags:
- 图像生成
---
# 通过colab体验ControlNet
首先，我们要会xxxx并且有一个Google账号。这是一句废话。

访问[https://colab.research.google.com/](https://colab.research.google.com/) 然后登陆自己的谷歌账号，

然后访问[https://github.com/camenduru/stable-diffusion-webui-colab/tree/v2.0](https://github.com/camenduru/stable-diffusion-webui-colab/tree/v2.0)

![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230320145933.png)


往下翻，或者搜索`controlnet` ，就能看到这样的一个文件,点击`open in colab`,就会跳转到colab界面

![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230320150108.png)


如图，点击我画出来的，运行这个notebook。经过一番耐心的等待，你在控制台的最下面会看到这么几行
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230320150717.png)

点击第二个或者第三个链接，会跳转到这个页面，我们主要用到的是`text2img`和`img2img`. 

我们以`text2img`为例，这里只说常用的功能，如图所示
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230320151053.png)

然后打开ControlNet功能
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230320151223.png)

打开之后如图
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230320151404.png)
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230320151648.png)

如果你想先看一下controlnet会按照什么来绘画，你可以通过创建画布下面的Preview来查看。

这里推荐一个网站[https://prompthero.com/search?model=Stable+Diffusion&q=video+game+concept+art&source=f7591caf953](https://prompthero.com/search?model=Stable+Diffusion&q=video+game+concept+art&source=f7591caf953) ,里面有各种各样的prompt，也是游戏风格的。

我们随便选一个prompt来生成一张图
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230320153127.png)

我们可以把图片放到`img2img`继续体验，使用方法和`text2img`基本一样。