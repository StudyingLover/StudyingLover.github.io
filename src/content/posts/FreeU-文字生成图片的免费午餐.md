---
title: FreeU-文字生成图片的免费午餐笔记
banner_img: https://cdn.studyinglover.com/pic/2023/10/c48e2f490270ef836b26f6d7ed8d7f0e.png
index_img: https://cdn.studyinglover.com/pic/2023/10/483c5afa7533a2e1dcaf2cf0273c6677.png
date: 2023-10-1 15:05:00
categories:
- 笔记
tags:
- 文字生成图片
---
# FreeU-文字生成图片的免费午餐

项目地址[主页](https://chenyangsi.top/FreeU/)

作者在这篇论文引入了一种对UNet的改进方式，不需要重新训练和微调。

![image.png](https://cdn.studyinglover.com/pic/2023/10/c48e2f490270ef836b26f6d7ed8d7f0e.png)



在UNet中存在两种连接，一种是上一层网络传递来的基础连接，主要贡献去噪能力。一种是跳线连接，主要贡献高频细节。UNet会将这两部分的特征contat之后作为下一层输入。作者的方法就是对这两部分做调整来提升图像质量。
![image.png](https://cdn.studyinglover.com/pic/2023/10/483c5afa7533a2e1dcaf2cf0273c6677.png)

从技术上讲，对于 U-Net 解码器的第 $l$ 个块，$\boldsymbol{x}_{l}$ 表示前一个块主主干的主干特征图，让 $h_l$ 表示通过相应跳过连接传播的特征图。为了调整这些特征图，作者引入了两个标量因子：$x_l$ 对应的主干特征比例因子 $b_l$ 和 $h_l$ 的跳线特征对应的比例因子 sl。具体来说，因子 $b_l$ 旨在放大主干特征图 $x_l$，而因子 $s_l$ 旨在衰减跳过特征图 $h_l$。对于主干特征，在实验调查中，作者发现通过与$b_l$相乘不加区别地放大$x_l$的所有通道，在生成的合成图像中产生过度平滑的纹理。原因是增强的U-Net在去噪时损害了图像的高频细节，所以将缩放操作限制在$x_l$的一半通道，如下所示:$$\boldsymbol{x}_{l,i}^{^{\prime}}=\begin{cases}b_l\cdot\boldsymbol{x}_{l,i},&\mathrm{~if~}i<C/2\\\boldsymbol{x}_{l,i},&\mathrm{~otherwise}&\end{cases}$$

其中$\boldsymbol{x}_{l,i}$ 是第$i$ 层的第$l$个特征图，$C$是通道数。这个方法不仅增强了主干的去噪能力，而且还避免了全局应用缩放的不良结果，从而在降噪和纹理保存之间取得更细微的平衡。

为了进一步缓解由于增强去噪而导致的过度平滑纹理问题，FreeU进一步在傅里叶域中使用光谱调制来选择性地减少跳过特征的低频分量。在数学上，此操作执行如下$$\begin{aligned}
\mathcal{F}(\boldsymbol{h}_{l,i})& =\operatorname{FFT}(\boldsymbol{h}_{l,i})  \\
\mathcal{F}^{\prime}(\boldsymbol{h}_{l,i})& =\mathcal{F}(\boldsymbol{h}_{l,i})\odot\boldsymbol{\alpha}_{l,i}  \\
\boldsymbol{h}_{l,i}^{\prime}& =\mathrm{IFFT}(\mathcal{F}^{\prime}(\boldsymbol{h}_{l,i})) 
\end{aligned}$$

$\mathrm{FFT}(\cdot)$ 和 $\operatorname{IFFT}(\cdot)$ 是傅里叶变换和反傅里叶变换，$\odot$ 是逐元素乘法。

$\boldsymbol{\alpha}_{l,i}$是一个傅里叶掩码，用于设定$s_l$的大小，$R$是半径，$r_\mathrm{thresh}$ 是频率阈值
$$\boldsymbol{\alpha}_{l,i}(r)=\begin{cases}s_l&\mathrm{~if~}r<r_\mathrm{thresh},\\1&\text{ otherwise.}&\end{cases}$$
 