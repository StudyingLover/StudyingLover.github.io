---
title: ControlNet训练自己数据集
banner_img: https://proxy.thisis.plus/202304271933740.png
date: 2023-4-27 19:36:00
tags:
- 图像生成
---
# ControlNet训练自己数据集
## 从官方仓库训练
官方教程
https://github.com/lllyasviel/ControlNet/blob/main/docs/train.md

### 环境配置
先看一下有没有显卡
```bash
nvidia-smi
```


首先下载整个仓库
```bash
git clone https://github.com/lllyasviel/ControlNet.git
```

然后创建conda虚拟环境(选做，只要你能配好环境)
```bash
conda env create -f environment.yaml
conda activate control
```

接下来需要下载stable diffusion和训练集，因为我们是对stable diffusion 模型做微调。

下载sd1.5到，models目录
```bash
cd ./models
wget https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned.ckpt
```

下载训练数据集到training文件夹
```bash
mkdir training 
cd ./training
wget https://huggingface.co/lllyasviel/ControlNet/resolve/main/training/fill50k.zip
```
解压数据集
```bash
unzip fill50k.zip
```

当然这个数据集非常大，我们也可以选择小一点的
```bash
wget https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/diffusers/controlnet_training/conditioning_image_1.png

wget https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/diffusers/controlnet_training/conditioning_image_2.png
```
然后将conditioning_image_1.png改名0.png放到./source目录下,conditioning_image_2.png改名放到./target目录下
```bash
mv conditioning_image_1.png 0.png 
mv 0.png ./source

mv conditioning_image_2.png 0.png 
mv 0.png ./target
```

然后创建一个`prompt.json` 的文件写入
```json
{"source": "source/0.png", "target": "target/0.png", "prompt": "pale golden rod circle with old lace background"}
```

无论是哪种方式，最后的文件结构是这样的![image.png](https://proxy.thisis.plus/20230427191856.png)


### 训练
首先调一下`tutorial_train.py` 里的batch_size，训练过程中如果出现out of memory 的情况可以调小。

接下来运行tutorial_train.py，闭上眼睛等待训练完成即可
```bash
python tutorial_train.py
```
如果是完整数据集，大概6个小时一个epoch，如果是单张图片会很快。

当然，为了不要出现网不好ssh断掉导致训练终端，我们可以使用screne
```bash
screen -S train 
conda activate control 
python tutorial_train.py
```
训练出的结果可以在`image_log` 中看到

![image.png](https://proxy.thisis.plus/20230427191937.png)


### 踩坑解决

#### out of memory(oom)
首先开启`save_memory`模式，将`config.py` 中False改为True

同时调低batch_size

#### No operator found for `memory_efficient_attention_backward`

卸载 xformers
```bash
pip uninstall  xformers
```

#### TypeError: on_train_batch_start() missing 1 required positional argument: 'dataloader_idx'
这个比较坑，是论文代码有问题，改一下源码就好
1. ControlNet/ldm/models/diffusion/ddpm.py文件591行
```python
def on_train_batch_start(self, batch, batch_idx, dataloader_idx):
```
删除dataloader_idx,改为
```python
def on_train_batch_start(self, batch, batch_idx):
```

2. ControlNet/cldm/logger.py文件74行
```python
def on_train_batch_end(self, trainer, pl_module, outputs, batch, batch_idx, dataloader_idx):
```
删除dataloader_idx，改为
```python
def on_train_batch_end(self, trainer, pl_module, outputs, batch, batch_idx):
```

