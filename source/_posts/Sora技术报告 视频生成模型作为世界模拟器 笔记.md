---
title: Sora技术报告 视频生成模型作为世界模拟器 笔记
banner_img: https://cdn.studyinglover.com/pic/2024/02/f76b1abdeee15868647eca59c2a484f4.png
index_img: https://cdn.studyinglover.com/pic/2024/02/f76b1abdeee15868647eca59c2a484f4.png
date: 2024-2-16 17:55:00
tags:
- 笔记
- 文字生成视频
---

# Sora技术报告 视频生成模型作为世界模拟器 笔记

技术报告原题目叫做 Video generation models as world simulators，翻译一下就是 **视频生成模型作为世界模拟器**，地址在[这里](https://openai.com/research/video-generation-models-as-world-simulators) 。我写的时候是翻译和笔记并行，翻译感谢gpt4出色的翻译能力。

技术报告介绍了OpenAI在视频数据上大规模训练生成模型的探索，特别是在视频和图像上联合训练文本条件扩散模型，这些视频和图像具有不同的持续时间、分辨率和宽高比。通过利用在视频和图像潜码的时空补丁上操作的变压器架构，OpenAI的最大模型Sora能够生成高保真度的一分钟视频。研究结果表明，扩大视频生成模型的规模是构建物理世界通用模拟器的一个有前景的路径。

## 主要内容

### **视频数据的生成模型**
之前的研究主要集中在使用各种方法（如循环网络、生成对抗网络、自回归变换器和扩散模型）对视频数据进行建模。Sora作为一个通用的视觉数据模型，能够生成持续时间、宽高比和分辨率各异的视频和图像，最长可达一分钟的高清视频。
<video controls="" loop="" muted="" playsinline="true" src="https://cdn.openai.com/tmp/s/title_0.mp4"></video>

###  **将视觉数据转换为补丁**
受到大型语言模型在互联网规模数据上训练获得通用能力的启发，Sora采用视觉补丁作为有效的表示形式，将视频压缩成低维潜在空间，并将这些表示分解为时空补丁。
 ![](https://cdn.studyinglover.com/pic/2024/02/f76b1abdeee15868647eca59c2a484f4.png)

看到这里我们就能发现这很openai, 把文字或者视频变成一个token，那接下来就能用上openai的看家本领gpt了。这里的视觉编码器我猜测是 I3D(Quo Vadis, Action Recognition? A New Model and the Kinetics Dataset, 一个视频理解模型，采用双流网络的架构，他的核心贡献是提出了如何对2d网络进行膨胀操作，同时提出了一个新的数据集 Kinetics)

###  **视频压缩网络**
通过训练一个降低视觉数据维度的网络，Sora在这个压缩的潜在空间内进行训练并生成视频。同时，还训练了一个相应的解码器模型，将生成的潜在表示映射回像素空间。

在去年前年文字生成图片爆火的一段时间中，stable diffusion已经证明了在latent space生成图片效果很好，就是这张经典的图
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230420095529.png)

迁移到视频生成上面，在latent space生成一个视频，然后用一个类似VAE decoder的结构解码成正常的视频。(合理猜测是已经有论文做过了，但是我论文读的不多不清楚)

### Spacetime Latent Patches
给定一个压缩的输入视频，我们提取一系列时空补丁，这些补丁作为变换器令牌。这个方案也适用于图像，因为图像只是带有单一帧的视频。我们基于补丁的表示法使得Sora能够训练具有可变分辨率、持续时间和宽高比的视频和图像。在推理时，我们可以通过在一个适当大小的网格中随机初始化补丁来控制生成视频的大小。

这个不太好翻译，我只能翻译成时空上的隐空间，就是前面encoder抽出来的一串token, 和nlp的token类似，但是已经是好多个了，所以叫patch。通过初始化patch来控制视频大小我没太理解，蹲一个大佬的讲解或者实现

###  **Scaling transformers用于视频生成**
Sora是一个扩散模型，通过预测原始“干净”补丁，训练接收噪声补丁（和条件信息，如文本提示）的输入。作为一个扩散变换器，Sora展示了在视频模型上的有效扩展。
![](https://cdn.studyinglover.com/pic/2024/02/c477b8b4601f9fbc924309f318ebff08.png)

读到这他已经承认他是一个diffusion模型了，给出的这个示例也能看出来去噪的过程

###  **变量持续时间、分辨率、宽高比**
过去的图像和视频生成方法通常会将视频调整大小、裁剪或修剪为标准尺寸，例如，分辨率为 256x256 的 4 秒视频。与传统方法不同，Sora在其原生大小的数据上进行训练，提供了采样的灵活性，改善了构图和画面布局。对原始大小的数据进行训练有几个好处。

#### **语言理解**
通过对视频进行高度描述性的字幕训练，Sora能够生成高质量的视频，准确地遵循用户提示。

####  **图像和视频的提示**
Sora不仅可以根据文本提示生成视频，还可以接受现有图像或视频作为输入，执行一系列图像和视频编辑任务。

####  **模拟能力**
Sora展示了一些有趣的模拟能力，如3D一致性、长期连贯性和对象持久性，以及与物理世界的简单交互模拟。

好吧我不理解，为啥直接在原视频训练效果就好了？难道openai卡多跑了所有可能？这让我想起来了CLIP那张整整一页的大图
![](https://cdn.studyinglover.com/pic/2024/02/f4f404c3b31a85c7a9f68139e5255b80.png)

  

### 通过图像和视频进行提示
#### DALL·E 图像动画
Sora 能够生成提供图像和提示作为输入的视频。下面我们展示基于[DALL·E 2](https://openai.com/research/video-generation-models-as-world-simulators#fn-31)生成的示例视频和[DALL·E  3 ](https://openai.com/research/video-generation-models-as-world-simulators#fn-30)图片。

我合理猜测下，这里和stable diffusion 图生图的方法差不多，最开始的采样不是一个纯粹的高斯噪声，而是将输入的图片过一个VAE的encoder(不一定是这个架构),接着继续采样

#### 扩展生成的视频
Sora 还能够在时间上向前或向后扩展视频。下面是四个视频，它们都是从生成的视频片段开始向后延伸的。因此，这四个视频的开头都不同，但所有四个视频的结局都是相同的。  

和stable diffusion 图生图的方法应该也差不多？最开始的采样不是一个纯粹的高斯噪声，而是将输入的视频过一个视频的encoder(猜测I3D),接着继续采样。但是我很好奇怎么向前扩展？依然是预测一个噪声然后减去，只是训练的时候不训练去噪声过程训练加噪声过程？

### 视频到视频编辑

扩散模型启用了多种根据文本提示编辑图像和视频的方法。下面我们应用其中一种方法，SDEdit，到Sora。这项技术使 Sora 能够零镜头地改变输入视频的风格和环境。  

还是迁移了文字生成图片的方法，但是我没读过SDEdit这个论文

### 连接视频

我们还可以使用 Sora 在两个输入视频之间逐渐进行插值，从而在具有完全不同主题和场景构成的视频之间创建无缝过渡。在下面的示例中，中心的视频插值在左侧和右侧的相应视频之间。  

应该是第一个视频不断采样直到采样到有一帧和下一个视频第一帧相似度接近1或者差距很小？这里的评价指标应该是PSNR？显然这里不适合语义的指标

## 图像生成能力

Sora 还能够生成图像。我们通过在时间范围为一帧的空间网格中排列高斯噪声块来实现这一点。该模型可以生成各种尺寸的图像，分辨率高达 2048x2048。  

我猜测已经zero shot了

## 新兴的模拟功能

我们发现，视频模型在大规模训练时表现出许多有趣的新兴功能。这些功能使 Sora 能够模拟现实世界中人、动物和环境的某些方面。这些属性的出现对 3D、物体等没有任何明确的归纳偏差——它们纯粹是尺度现象。

**3D 一致性。** Sora 可以生成带有动态摄像机运动的视频。随着摄像机的移动和旋转，人和场景元素在三维空间中一致移动。  

**远程相干性和物体持久性。** 视频生成系统面临的一个重大挑战是在采样长视频时保持时间一致性。我们发现 Sora 通常（尽管并非总是）能够有效地对短期和长期依赖关系进行建模。例如，我们的模型可以保留人、动物和物体，即使它们被遮挡或离开框架。同样，它可以在单个样本中生成同一角色的多个镜头，并在整个视频中保持其外观。  

**与世界互动。** 索拉有时可以用简单的方式模拟影响世界状况的动作。例如，画家可以在画布上留下新的笔触，并随着时间的推移而持续存在，或者一个人可以吃汉堡并留下咬痕。  

**模拟数字世界。** Sora 还能够模拟人工过程——一个例子是视频游戏。Sora 可以同时通过基本策略控制《我的世界》中的玩家，同时以高保真度渲染世界及其动态。这些能力可以通过用提及“我的世界”的标题提示 Sora 来零射击。  

这些功能表明，视频模型的持续扩展是开发物理和数字世界以及生活在其中的物体、动物和人的高性能模拟器的一条有前途的道路。  


## 讨论

Sora 目前作为模拟器表现出许多局限性。例如，它不能准确地模拟许多基本相互作用的物理过程，例如玻璃破碎。其他交互（例如吃食物）并不总是会产生对象状态的正确变化。[我们在登陆页面](https://openai.com/sora)中列举了模型的其他常见故障模式，例如长时间样本中出现的不连贯性或对象的自发出现。  

我们相信，Sora 今天所拥有的能力表明，视频模型的持续扩展是开发物理和数字世界以及生活在其中的物体、动物和人的强大模拟器的一条有前途的道路。  

### 结论

OpenAI认为，继续扩大视频模型的规模是开发能够模拟物理和数字世界及其中的对象、动物和人的高能力模拟器的有前景的路径。