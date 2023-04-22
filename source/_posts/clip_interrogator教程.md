---
title: clip_interrogator教程
banner_img: https://drive.studyinglover.com/api/raw/?path=/photos/blog/background/1679397024795.jpeg
date: 2023-4-22 22:24:00
tags:
- 图像生成
---
# clip_interrogator教程
文字生成图片是近年来多模态和大模型研究的热门方向，openai提出的CLIP提供了一个方法建立起了图片和文字的联系，但是只能做到给定一张图片选择给定文本语义最相近的那一个，实际项目开发中我们总是需要从一张图片获取描述，感谢社区的活力，clip-interrogator应运而生。

受限于clip-interrogator 等于没有的文档，就有了这篇文章来写一些怎么使用clip-interrogator。

clip-interrogator项目地址[GitHub](https://github.com/pharmapsychotic/clip-interrogator)

在线体验[huggingface-clip-interrogator](https://huggingface.co/spaces/pharma/CLIP-Interrogator) [huggingface-clip-interrogator2](https://huggingface.co/spaces/fffiloni/CLIP-Interrogator-2) 

## 安装
```bash
pip install clip-interrogator==0.5.4
```

如果需要BLIP2最新的WIP支持，运行
```bash
pip install clip-interrogator==0.6.0
```

## 使用
### 快速开始
```python
from PIL import Image
from clip_interrogator import Config, Interrogator
image = Image.open(image_path).convert('RGB')
ci = Interrogator(Config(clip_model_name="ViT-L-14/openai"))
print(ci.interrogate(image))
```

将`image_path` 换成自己图片的路径即可

### 模型
这里使用的模型的是openai的ViT-L-14。

我们也可以更改模型，使用`ViT-H-14/laion2b_s32b_b79k`或者
`'RN50/openai', 'RN50-quickgelu/openai', 'RN101/openai', 'RN101-quickgelu/openai', 'RN50x4/openai', 'RN50x16/openai', 'RN50x64/openai', 'ViT-B-32/openai', 'ViT-B-32-quickgelu/openai', 'ViT-B-16/openai', 'ViT-L-14/openai', 'ViT-L-14-336/openai'`

例如使用`RN50-quickgelu/openai` 的用法就是`ci = Interrogator(Config(clip_model_name="RN50-quickgelu/openai"))`

> 文档中有这么一句ViT-L for Stable Diffusion 1, and ViT-H for Stable Diffusion 2，意思是 ViT-L 是给 Stable Diffusion 1 用的，ViT-H是给 Stable Diffusion 2 用的


### 模式
模式有`best` ， `classic` 和 `fast` 三种种，开发者在这里的设计很奇怪，不同模式的使用不是传不同的参数而是使用不同的方法。`best` 模式就是上面的用法，`fast` 模式的用法是
```python
from PIL import Image
from clip_interrogator import Config, Interrogator
image = Image.open(image_path).convert('RGB')
ci = Interrogator(Config(clip_model_name="RN50-quickgelu/openai"))
print(ci.interrogate_fast(image))
```

`classic` 模式用法
```python
from PIL import Image
from clip_interrogator import Config, Interrogator
image = Image.open(image_path).convert('RGB')
ci = Interrogator(Config(clip_model_name="RN50-quickgelu/openai"))
print(ci.interrogate_classic(image))
```

### quiet 
`quiet` 选项的作用是不输出中间过程，使用方法是直接写进Config 即可
，例如
```python
from PIL import Image
from clip_interrogator import Config, Interrogator
image = Image.open('/content/test.png').convert('RGB')
ci = Interrogator(Config(clip_model_name="RN50-quickgelu/openai",quiet=True))
print(ci.interrogate_fast(image))
```

使用前，会有各种进度条
![image.png](https://proxy.thisis.plus/20230422221658.png)

使用后，所有过程中的输出会被隐藏
![image.png](https://proxy.thisis.plus/20230422221818.png)



## 自定义词库
如果你安装的是0.6.0，那么可以使用自定义词库

```python
from clip_interrogator import Config, Interrogator, LabelTable, load_list
from PIL import Image

ci = Interrogator(Config(blip_model_type=None))
image = Image.open(image_path).convert('RGB')
table = LabelTable(load_list('terms.txt'), 'terms', ci)
best_match = table.rank(ci.image_to_features(image), top_count=1)[0]
print(best_match)
```