---
title: TruFor笔记和代码复现
banner_img: https://cdn.studyinglover.com/pic/2023/11/35a3ffa0a81b1791e692c591a92b9256.png
date: 2023-11-28 17:38:00
tags:
- 图像伪造检测和定位
---

# TruFor笔记和代码复现
最近有个新闻很火，说[谷歌 AI 技术曾判定美国登月任务的照片存在虚假内容](https://www.zhihu.com/question/631987370) 有[大佬找到了出处](https://www.zhihu.com/question/631868923/answer/3304947739)，使用的是google 的论文[arxiv](https://doi.org/10.48550/arXiv.2212.10957)，代码开源在[GitHub](https://github.com/grip-unina/TruFor)

## 笔记
这篇论文介绍了一个名为TruFor的图像伪造检测和定位框架。该框架可以应用于各种图像处理方法，包括基于深度学习的伪造方法。TruFor利用了RGB图像和一个学习的噪音敏感指纹来提取高级和低级痕迹，最终输出像素级别的定位图和整个图像的完整性分数，以及一个可靠性映射，用于减少误报。

![image.png](https://cdn.studyinglover.com/pic/2023/11/35a3ffa0a81b1791e692c591a92b9256.png)

它包括以下几个关键组件：
1. **Noiseprint++ 提取器**：该提取器从RGB图像中获取一个学习的噪声敏感指纹。 
2. **编码器**：编码器使用RGB输入和Noiseprint++共同计算将被异常解码器和置信度解码器使用的特征。
3. **异常解码器和置信度解码器**：这两个解码器分别用于像素级别的伪造定位和置信度估计。
4. **伪造检测器**：该检测器利用定位图和置信度图进行图像级别的决策。

这些组件通过三个训练阶段进行学习：
1. 首先，使用大量原始图像数据集训练Noiseprint++提取器。
2. 然后，使用相同的数据集训练异常定位网络的编码器和解码器。
3. 最后，使用相同的数据集训练置信度图解码器和伪造检测器。

通过这些组件和训练阶段，TruFor框架能够在各种图像伪造方法中实现可靠的检测和定位。

模型输出包括以下三个部分：
1. 全局完整性得分（Global Integrity Score）：该得分表示图像的整体真实性，用于自动图像伪造检测。
2. 异常定位图（Anomaly Localization Map）：该图表示图像中可能存在伪造的区域。通过分析异常定位图，用户可以识别被篡改的区域。 
3. 置信度图（Confidence Map）：该图突出显示了异常定位图中可能存在误报的区域。通过分析置信度图，用户可以区分异常定位图中的真实伪造区域预测和随机异常。
这三个输出为用户提供了有关图像真实性和可能篡改区域的全面信息，有助于进行进一步的分析

## 代码复现
作者在github上给出了一个复现方法，git clone之后`bash docker_build.sh`，`bash docker_run.sh`。使用docker固然容易复现，但是这个项目并没有什么奇怪的依赖，所以我们可以大胆直接跑。(如果你想用docker跑我劝你不要，因为代码有bug需要修)

首先clone项目
```bash
git clone https://github.com/grip-unina/TruFor
```

然后下载依赖，作者没有给requirements.txt,我从Dockerfile找到了下载依赖的部分
```
pip install tqdm yacs>=0.1.8 timm>=0.5.4 numpy==1.21.5
```

接下来cd到`test_docker`文件夹，下载模型
```bash
cd test_docker
wget -q -c https://www.grip.unina.it/download/prog/TruFor/TruFor_weights.zip
unzip -q -n TruFor_weights.zip && rm TruFor_weights.zip
```
你的`test_docker` 文件夹下应该有一个`weights`文件下，下面有一个文件`trufor.pth.tar` 

接下来，运行下面的命令复现测试
```bash
cd src
python trufor_test.py
```
你注意一下，如果爆显存了就运行,这样会使用cpu推理
```
python trufor_test.py --gpu -1
```

运行结束后你在`test_docker/output` 目录下应该能看到这样的四个文件![image.png](https://cdn.studyinglover.com/pic/2023/11/2d1d99ebe3d6b02a819ebea0c6a99108.png)

你也可以指定推理的图片和保存位置，参考`python trufor_test.py -h`，可以传一个文件或者文件夹
```
usage: trufor_test.py [-h] [-gpu GPU] [-in INPUT] [-out OUTPUT] [-save_np] ...

Test TruFor

positional arguments:
  opts                  other options

options:
  -h, --help            show this help message and exit
  -gpu GPU, --gpu GPU   device, use -1 for cpu
  -in INPUT, --input INPUT
                        can be a single file, a directory or a glob statement
  -out OUTPUT, --output OUTPUT
                        output folder
  -save_np, --save_np   whether to save the Noiseprint++ or not
```

接下来让我们可视化异常检测图，回到`test_docker`文件夹,

**很重要！！** 请看`visualize.py` 他的第32行是不是
```python
fig.suptitle('score: %.3f' % result['score_sigmoid'])
```

这是个错误！请将他改成下面的代码

```python
fig.suptitle('score: %.3f' % result['score'])
```

运行下面的命令，记得把`/path/to`改成你的真实路径
```
cd ..
python visualize.py --image /path/to/TruFor/test_docker/images/pristine1.jpg --output /path/to/TruFor/test_docker/output/pristine1.jpg.npz
```
我们可以得到推理结果
![image.png](https://cdn.studyinglover.com/pic/2023/11/14badab7dc04320b5cd8888aa7c85ef4.png)

ok,让我们来看看宇航员的图片吧，先下载两张图
```bash
wget https://history.nasa.gov/alsj/a15/AS15-92-12407HR.jpg
wget https://history.nasa.gov/alsj/a15/AS15-92-12424HR.jpg
```
我直接给出运行结果
![image.png](https://cdn.studyinglover.com/pic/2023/11/b6e81c8ccb74234afe93cb6d6386d595.png)
![image.png](https://cdn.studyinglover.com/pic/2023/11/df66071be970b7b2d832dbd493f2a618.png)
