---
title: Everybody Dance Now笔记
banner_img: https://drive.studyinglover.com/api/raw/?path=/photos/blog/background/1679397019134.png
date: 2023-03-11 16:38:00
categories:
- 笔记
tags:
- 图像生成
---
# Everybody Dance Now
为了完成给定一个人跳舞的视频到另一个人的目标，文章作者将这个过程分成三部：**pose detection, global pose normalization, and mapping from normalized pose stick figures to the target subject**

## pose detection
使用openpose对骨骼点进行标注$(x,y)$ 
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230311142224.png)

## global pose normalization 
在不同的视频中，被拍摄的对象的肢体比例可能不同，或者站得离相机更近或更远。因此，在将两个对象之间的动作进行转换时，可能需要转换源人物的姿势关键点，使其符合目标人物的身体形状和位置，就像图3中的转换部分一样。作者通过分析每个人物的姿势高度和脚踝位置，并在两个视频中的最近和最远脚踝位置之间使用线性映射来找到这种转换。在收集这些位置之后，再根据每个帧的对应姿势检测计算其比例和平移。
![原文图三](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230311142651.png)

## mapping from normalized pose stick figures to the target subject 
1. 训练一个可以从source生成target人物的pix2pix GAN
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230311143611.png)

3. motion transfer 把source的舞蹈转移到目标人物身上
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230311143636.png)

4. 对人脸做特别的修正，使用了faceGAN
 ![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230311143533.png)
