---
title: open_clip编码图像和文本
banner_img: https://cdn.studyinglover.com/pic/2023/07/d0c501668714918b17bd10244971fcb1.png
date: 2023-7-13 23:14:00
categories:
- 多模态
---

open_clip是CLIP的开源实现版本，只训练了CLIP效果最好的几个模型。

安装是
```bash
pip install open_clip_torch
```

首先导入 open_clip，并创建相关模型
```python
import open_clip
import torch

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
clip_model_name = "ViT-L-14"
clip_model,_,clip_preprocess = open_clip.create_model_and_transforms(clip_model_name
clip_model_name,pretrained = "openai",precision='fp16' if device == 'cuda' else 'fp32',device=device,
)

tokenize = open_clip.get_tokenizer(clip_model_name)
```

`tokenize` 是分词器，所有的文本都要先经过分析器才能放入模型进行推理。

#### 编码图像
```python
def image_to_features(image: Image.Image) -> torch.Tensor:
	images = clip_preprocess(image).unsqueeze(0).to(device)
	with torch.no_grad(), torch.cuda.amp.autocast():
	image_features = clip_model.encode_image(images)
	return image_features
  
img = cv.imread("/path/to/example.png")
img = Image.fromarray(img)

image_feature = image_to_features(img)
```

`/path/to/example.png` 替换成自己图片的路径

`image_to_features` 函数是一个封装过的将图像转成文本的函数，传入的参数是一个`image_to_features`格式的图片。

`image_feature` 就是经过CLIP的编码器得到的特征

#### 编码文本
```python
prompt = "a photo of a cat"
text_tokens = tokenize([prompt]).to(device)
text_features = clip_model.encode_text(text_tokens)
```

`text_features` 就是得到的特征。