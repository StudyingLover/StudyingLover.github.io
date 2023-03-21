---
title: yolov5和yolov5-face环境搭建和常见踩坑
banner_img: https://cloud.studyinglover.com/api/raw/?path=/photos/blog/33a1d238f41bcd6994390b5a52067cd6.png
date: 2023-2-7 16:49:00
categories:
- 踩坑
tags:
- 机器视觉
---
## yolov5环境搭建
在随便哪新建一个`requirements.txt`文件
内容是
``` txt
# YOLOv5 requirements
# Usage: pip install -r requirements.txt

# Base ----------------------------------------
matplotlib>=3.2.2
numpy>=1.18.5
opencv-python>=4.1.1
Pillow>=7.1.2
PyYAML>=5.3.1
requests>=2.23.0
scipy>=1.4.1
torch>=1.7.0
torchvision>=0.8.1
tqdm>=4.64.0
protobuf<=3.20.1  # https://github.com/ultralytics/yolov5/issues/8012

# Logging -------------------------------------
tensorboard>=2.4.1
# wandb
# clearml

# Plotting ------------------------------------
pandas>=1.1.4
seaborn>=0.11.0

# Export --------------------------------------
# coremltools>=5.2  # CoreML export
# onnx>=1.9.0  # ONNX export
# onnx-simplifier>=0.4.1  # ONNX simplifier
# nvidia-pyindex  # TensorRT export
# nvidia-tensorrt  # TensorRT export
# scikit-learn==0.19.2  # CoreML quantization
# tensorflow>=2.4.1  # TFLite export (or tensorflow-cpu, tensorflow-aarch64)
# tensorflowjs>=3.9.0  # TF.js export
# openvino-dev  # OpenVINO export

# Extras --------------------------------------
ipython  # interactive notebook
psutil  # system utilization
thop>=0.1.1  # FLOPs computation
# albumentations>=1.0.3
# pycocotools>=2.0  # COCO mAP
# roboflow

```
然后在当前目录下打开命令行，创建一个环境
``` bash
conda create -n yolov5 python
```
创建好环境之后，激活环境
``` bash
conda activate yolov5
```
然后安装依赖
``` bash
pip install -r requirements.txt
```
安装完成后代码就可以运行了

## 划分数据集
新建一个`split_train_val.py`文件，内容如下
``` python
import os
import shutil
import random

def split_dataset(src_folder, dest_folder, ratio):
    images_folder = os.path.join(src_folder, "images")
    labels_folder = os.path.join(src_folder, "labels")

    if not os.path.exists(images_folder) or not os.path.exists(labels_folder):
        raise Exception("Source folder doesn't exist.")
    if not os.path.exists(dest_folder):
        os.makedirs(dest_folder)

    train_folder = os.path.join(dest_folder, "train")
    val_folder = os.path.join(dest_folder, "val")
    if not os.path.exists(train_folder):
        os.makedirs(train_folder)
    if not os.path.exists(val_folder):
        os.makedirs(val_folder)

    train_images_folder = os.path.join(train_folder, "images")
    train_labels_folder = os.path.join(train_folder, "labels")
    val_images_folder = os.path.join(val_folder, "images")
    val_labels_folder = os.path.join(val_folder, "labels")
    if not os.path.exists(train_images_folder):
        os.makedirs(train_images_folder)
    if not os.path.exists(train_labels_folder):
        os.makedirs(train_labels_folder)
    if not os.path.exists(val_images_folder):
        os.makedirs(val_images_folder)
    if not os.path.exists(val_labels_folder):
        os.makedirs(val_labels_folder)

    images = [f for f in os.listdir(images_folder) if f.endswith(".bmp") ]
    num_images = len(images)

    for i, image in enumerate(images):
        image_path = os.path.join(images_folder, image)
        label_path = os.path.join(labels_folder, os.path.splitext(image)[0] + ".txt")
        if random.uniform(0, 1) < ratio:
            dest_images_folder = train_images_folder
            dest_labels_folder = train_labels_folder
        else:
            dest_images_folder = val_images_folder
            dest_labels_folder = val_labels_folder
        shutil.copy2(image_path, os.path.join(dest_images_folder, image))
        shutil.copy2(label_path, os.path.join(dest_labels_folder, os.path.splitext(image)[0] + ".txt"))
        print("Copied {}/{} images".format(i + 1, num_images))

if __name__ == "__main__":
    src_folder = ""# 原始数据集的路径
    dest_folder = ""# 分割后的数据集的路径
    ratio = 0.8  # 将 80% 的图片分到训练集，20% 的图片分到验证集

    split_dataset(src_folder, dest_folder, ratio)

```
划分训练集和验证集，运行`split_train_val.py`，传入刚才保存的文件夹路径，会将图片和标签划分到一个新的文件夹
```
- data
    - train
        - images
        - labels
    - val
        - images
        - labels
```

## yolov5常见踩坑
###  not enough values to unpack (expected 2, got 0)
如图
![](https://drive.studyinglover.com/api/raw/?path=/photos/blog/yolov5-setting/93bbd4d663cd589dfdd522e0479bb46.png)

我们需要检查一下我们标记的txt文件
举个例子

这是我们需要的标记格式

```txt
0 0.5 0.5 0.5 0.5
```

这是错误的标注格式
```txt
0 0.5 0.5 0.5 0.5

```

问题就出在了最后一行的`\n`上，我们删除最后一行就可以了。我用chatGPT写了一个函数来做这件事
```python
# 去除txt文件中的空行
def remove_empty_lines(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()
    with open(file_path, 'w') as f:
        for line in lines:
            if len(line)>3:
                f.write(line)
```

### AssertionError: No results.txt files found in /content/yolov5-face/runs/train/exp, nothing to plot.

```
Traceback (most recent call last):
File "train.py", line 513, in
train(hyp, opt, device, tb_writer, wandb)
File "train.py", line 400, in train
plot_results(save_dir=save_dir) # save as results.png
File "/content/yolov5-face/utils/plots.py", line 393, in plot_results
assert len(files), 'No results.txt files found in %s, nothing to plot.' % os.path.abspath(save_dir)
AssertionError: No results.txt files found in /content/yolov5-face/runs/train/exp, nothing to plot.
```
出现这个问题的原因是此代码块未运行
```python
# Results
       if ckpt.get('training_results') is not None:
           with open(results_file, 'w') as file:
               file.write(ckpt['training_results'])  # write results.txt
```
如果你只使用单 GPU 并设置 epoch <20，这个块将不起作用。解决方案是设置epoch>20。