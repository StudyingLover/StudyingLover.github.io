---
title: Windows下yolov5环境搭建
banner_img: https://cloud.studyinglover.com/api/raw/?path=/photos/blog/33a1d238f41bcd6994390b5a52067cd6.png
date: 2023-2-9 15:00:00

---
# Windows下yolov5环境搭建
在随便那新建一个`requirements.txt`文件
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
代码就可以运行了
