---
title: Diffusers去除NSFW限制
banner_img: https://drive.studyinglover.com/api/raw/?path=/photos/blog/background/1679397024795.jpeg
date: 2023-6-11 0:02:00
tags:
- 文字生成图片
---
众所周知，~~涩涩是文字生成图片技术发展的重大推动力~~ . Huggingface的diffusers封装了大量的算法用于生成图片。但是，很不幸的，diffusers会检测生成的图片是否存在NSFW(**not safe for work**)的内容，~~这就给我们涩涩带来了不必要的麻烦~~。所以我将介绍如何去除限制 

该方法来自网友，[原链接](https://www.reddit.com/r/StableDiffusion/comments/wxba44/disable_hugging_face_nsfw_filter_in_three_step/) 

先给一段示例代码

```python
import numpy as np
import matplotlib.pyplot as plt
from diffusers import StableDiffusionPipeline
import cv2 as cv
if __name__ == '__main__':
	pipe = StableDiffusionPipeline.from_pretrained("CompVis/stable-diffusion-v1-4")
	new_image = pipe(prompt, num_inference_steps=20).images[0]
	plt.save('image.png',new_image)
```

我们只需要设置`StableDiffusionPipeline` 这个类的`safety_checker`函数，更改之后的代码
```python
import numpy as np
import matplotlib.pyplot as plt
from diffusers import StableDiffusionPipeline
import cv2 as cv
def dummy(images, **kwargs): 
	return images, False
if __name__ == '__main__':
	pipe = StableDiffusionPipeline.from_pretrained("CompVis/stable-diffusion-v1-4")
	pipe.safety_checker = dummy
	new_image = pipe(prompt, num_inference_steps=20).images[0]
	plt.save('image.png',new_image)
```

成功实现~~涩涩自由~~ 