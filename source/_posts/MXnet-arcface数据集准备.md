---
title: MXnet-arcface数据集准备
banner_img: https://proxy.thisis.plus/202304271933740.png
date: 2023-5-8 21:28:00
categories:
- 工具
---
众所周知，mxnet是一个沐神主导开发的一个深度学习框架，之前听李沐的讲论文时也听他说过很多次，但是已知没有机会使用，最近接触了一个项目，有机会感受了一些mxnet，但是也踩了很多坑。所有需要的脚本文件可以在[https://github.com/StudyingLover/menet-Arcface-tools](https://github.com/StudyingLover/menet-Arcface-tools)下载

![image.png](https://proxy.thisis.plus/202305082129080.png)

mxnet 的数据与别处的是不同的，他的训练集是两个文件，分别以`.idx` 和 `.rec` 结尾， 测试集是以`.bin` 结尾的一个二进制文件。

### 创建lst,idx,rec
我们需要按照特定方式放置图片,首先创建一个大的文件夹，里面创建一个个子文件夹，每个文件夹放置相同类别的图片
```
/image_folder
├── 0_0_0000000
│   ├── 0_0.jpg
│   ├── 0_1.jpg
│   ├── 0_2.jpg
│   ├── 0_3.jpg
│   └── 0_4.jpg
├── 0_0_0000001
│   ├── 0_5.jpg
│   ├── 0_6.jpg
│   ├── 0_7.jpg
│   ├── 0_8.jpg
│   └── 0_9.jpg
├── 0_0_0000002
│   ├── 0_10.jpg
│   ├── 0_11.jpg
│   ├── 0_12.jpg
│   ├── 0_13.jpg
│   ├── 0_14.jpg
│   ├── 0_15.jpg
│   ├── 0_16.jpg
│   └── 0_17.jpg
├── 0_0_0000003
│   ├── 0_18.jpg
│   ├── 0_19.jpg
│   └── 0_20.jpg
├── 0_0_0000004

```

接下来先生成一个`.lst` 文件，这个文件包含了所有的文件,训练集和测试集按照8：2划分
```bash
python -m mxnet.tools.im2rec --list --recursive train 图片文件夹 –test-ratio 0.8
```

这段代码会生成两个文件夹`train_train.lst` 和`train_test.lst` 

### 生成训练集文件
接下来生成训练集文件
```bash
python -m mxnet.tools.im2rec train_train.lst --quality 100 图片文件夹
```

需要给生成的文件改个名字
```bash
mv train_train.idx train.idx
mv train_train.rec train.rec
```

下面创建property配置文件
```
训练集图片数量 图片大小 图片大小
```

例如
```
10000 112 112
```

### 创建pair文件
这一步多少有点奇怪，pair文件里面的结构是
```
img1_path img2_path 0
img3_path img4_path 1
```
生成方式也很简单啦，运行
```bash
python3 generate_image_pairs.py --data-dir 图片文件夹路径 --outputtxt train.txt --num-samepairs 3000
```
`num-samepairs` 是个魔数，看心情写吧，这里我为了大量生成，我又写了个脚本，重复执行
```bash
python repeat_cmd.py
python detele_empty.py
cp train.txt 图片文件夹
```

### 生成验证集bin
```bash
python lfw2pack.py --data-dir 图片文件夹 --output test.bin --num-samepairs 300
```

ok就这样，我们生成了需要的`train.idx` `train.rec`,`test.bin`
