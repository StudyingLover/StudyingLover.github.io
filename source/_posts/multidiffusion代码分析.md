---
title: Multidiffusion代码分析
banner_img: https://proxy.thisis.plus/202305091237913.png
date: 2023-5-9 12:35:00
tags:
- 文字生成图片
---
# Multidiffusion代码分析

## 前言
当我们使用计算机生成图像时，经常会遇到一些困难，例如如何生成高质量、高分辨率的图像，如何控制图像的风格和内容等。近年来，深度学习技术在图像生成领域取得了很大的进展，其中一种流行的方法是使用变分自编码器（VAE）和生成对抗网络（GAN）等模型。然而，这些方法通常需要大量的训练数据和计算资源，而且生成的图像可能会出现一些问题，例如模糊、失真和不连续等。

为了解决这些问题，一些研究人员提出了一种新的合成全景图的方法，称为MultiDiffusion。该方法使用了一种多步推理的策略，将全景图像的生成过程分解成多个步骤，并在每个步骤中对潜变量向量进行微调，从而生成高质量、高分辨率的全景图像。MultiDiffusion方法不需要大量的训练数据和计算资源，而且能够生成具有良好视觉效果的全景图像。本文将介绍MultiDiffusion方法的实现细节，并提供相应的代码和解释。(chatgpt写的，大家凑活着看)

[官方主页](https://multidiffusion.github.io/)
[代码](https://github.com/omerbt/MultiDiffusion)
[在线体验](https://huggingface.co/spaces/weizmannscience/MultiDiffusion)

## 分析
```python
from transformers import CLIPTextModel, CLIPTokenizer, logging
from diffusers import AutoencoderKL, UNet2DConditionModel, DDIMScheduler
# suppress partial model loading warning
logging.set_verbosity_error()
import torch
import torch.nn as nn
import torchvision.transforms as T
import argparse
```
这里导入了所有的库，包括huggingface推出的transformers 和 diffusers。

```python
def seed_everything(seed):
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    # torch.backends.cudnn.deterministic = True
    # torch.backends.cudnn.benchmark = True
```
常规操作，设置随机数，实际上还有另一种写法[^1] . 这里是设置了torch 在CPU 和 GPU 的随机数
```python
def seed_torch(seed=1029):
    random.seed(seed)   # Python的随机性
    os.environ['PYTHONHASHSEED'] = str(seed)    # 设置Python哈希种子，为了禁止hash随机化，使得实验可复现
    np.random.seed(seed)   # numpy的随机性
    torch.manual_seed(seed)   # torch的CPU随机性，为CPU设置随机种子
    torch.cuda.manual_seed(seed)   # torch的GPU随机性，为当前GPU设置随机种子
    torch.cuda.manual_seed_all(seed)  # if you are using multi-GPU.   torch的GPU随机性，为所有GPU设置随机种子
    torch.backends.cudnn.benchmark = False   # if benchmark=True, deterministic will be False
    torch.backends.cudnn.deterministic = True   # 选择确定性算法
```
事实上，涉及到一些类似upsample 的层，因为原子加操作带来的浮点误差，永远也对不齐。  `a + b） + c != a + (b + c)`

```python
def get_views(panorama_height, panorama_width, window_size=64, stride=8):
    panorama_height /= 8
    panorama_width /= 8
    num_blocks_height = (panorama_height - window_size) // stride + 1
    num_blocks_width = (panorama_width - window_size) // stride + 1
    total_num_blocks = int(num_blocks_height * num_blocks_width)
    views = []
    for i in range(total_num_blocks):
        h_start = int((i // num_blocks_width) * stride)
        h_end = h_start + window_size
        w_start = int((i % num_blocks_width) * stride)
        w_end = w_start + window_size
        views.append((h_start, h_end, w_start, w_end))
    return views
```

这段代码的作用是将一个全景图像分成多个小块，每个块的大小为$window_{size} * window_{size}$，步长为$stride$，返回每个小块的位置信息。

下面类定义了整个multidiffusion的所有操作
```python
self.device = device
self.sd_version = sd_version
```
定义了设备(CPU/GPU)和stable diffusion的版本

```python
print(f'[INFO] loading stable diffusion...')

if hf_key is not None:
	print(f'[INFO] using hugging face custom model key: {hf_key}')
	model_key = hf_key
elif self.sd_version == '2.1':
	model_key = "stabilityai/stable-diffusion-2-1-base"
elif self.sd_version == '2.0':
	model_key = "stabilityai/stable-diffusion-2-base"
elif self.sd_version == '1.5':
	model_key = "runwayml/stable-diffusion-v1-5"
else:
	raise ValueError(f'Stable-diffusion version {self.sd_version} not supported.')
```
加载了stable diffusion的版本 

```python
# Create model
	self.vae = AutoencoderKL.from_pretrained(model_key, subfolder="vae").to(self.device)
	self.tokenizer = CLIPTokenizer.from_pretrained(model_key, subfolder="tokenizer")
	self.text_encoder = CLIPTextModel.from_pretrained(model_key, subfolder="text_encoder").to(self.device)
	self.unet = UNet2DConditionModel.from_pretrained(model_key, subfolder="unet").to(self.device)
	self.scheduler = DDIMScheduler.from_pretrained(model_key, subfolder="scheduler")
	print(f'[INFO] loaded stable diffusion!')
```
这里是从预训练模型加载并创建模型，分别加载了VAE，tokenizer，text_encoder

|模型|内容|
|-|-|
|VAE|变分自动编码器|
|tokenizer|分词器,负责将一句话分割成一个一个词，这里是CLIPTokenizer|
|text_encoder|文本编码器|
|UNet2DConditionModel|Unet，负责重建和预测|
|DDIMScheduler|DDIM采样器|


```python
def get_text_embeds(self, prompt, negative_prompt):
	# prompt, negative_prompt: [str]
	# Tokenize text and get embeddings
	text_input = self.tokenizer(prompt, padding='max_length', max_length=self.tokenizer.model_max_length,
								truncation=True, return_tensors='pt')
	text_embeddings = self.text_encoder(text_input.input_ids.to(self.device))[0]

	# Do the same for unconditional embeddings
	uncond_input = self.tokenizer(negative_prompt, padding='max_length', max_length=self.tokenizer.model_max_length, return_tensors='pt')
	uncond_embeddings = self.text_encoder(uncond_input.input_ids.to(self.device))[0]

	# Cat for final embeddings
	text_embeddings = torch.cat([uncond_embeddings, text_embeddings])
	return text_embeddings
```
这里是将提示(prompt) 转换成了text_embeddings、

```python
def decode_latents(self, latents):
        latents = 1 / 0.18215 * latents
        imgs = self.vae.decode(latents).sample
        imgs = (imgs / 2 + 0.5).clamp(0, 1)
        return imgs
```
这段代码作用是将一个向量从latent space 解码成一个图像。

它接收一个潜变量向量集合作为输入，并使用变分自编码器（VAE）将其解码成图像。他将输入的潜变量向量集合除以0.18215进行缩放(魔数，不知原因)，然后调用VAE的decode方法来生成一组图像同时使用sample方法产生一些随机性，从而增加输出图像的多样性。最后缩放到$[0,1]$ 范围内。

```python
def text2panorama(self, prompts, negative_prompts='', height=512, width=2048, num_inference_steps=50, guidance_scale=7.5):
        if isinstance(prompts, str):
            prompts = [prompts]
  
        if isinstance(negative_prompts, str):
            negative_prompts = [negative_prompts]
  
        # Prompts -> text embeds
        text_embeds = self.get_text_embeds(prompts, negative_prompts)  # [2, 77, 768]
  
        # Define panorama grid and get views
        latent = torch.randn((1, self.unet.in_channels, height // 8, width // 8), device=self.device)
        views = get_views(height, width)
        count = torch.zeros_like(latent)
        value = torch.zeros_like(latent)
  
        self.scheduler.set_timesteps(num_inference_steps)
  
        with torch.autocast('cuda'):
            for i, t in enumerate(self.scheduler.timesteps):
                count.zero_()
                value.zero_()
  
                for h_start, h_end, w_start, w_end in views:
                    # TODO we can support batches, and pass multiple views at once to the unet
                    latent_view = latent[:, :, h_start:h_end, w_start:w_end]
  
                    # expand the latents if we are doing classifier-free guidance to avoid doing two forward passes.
                    latent_model_input = torch.cat([latent_view] * 2)
  
                    # predict the noise residual
                    noise_pred = self.unet(latent_model_input, t, encoder_hidden_states=text_embeds)['sample']
  
                    # perform guidance
                    noise_pred_uncond, noise_pred_cond = noise_pred.chunk(2)
                    noise_pred = noise_pred_uncond + guidance_scale * (noise_pred_cond - noise_pred_uncond)
  
                    # compute the denoising step with the reference model
                    latents_view_denoised = self.scheduler.step(noise_pred, t, latent_view)['prev_sample']
                    value[:, :, h_start:h_end, w_start:w_end] += latents_view_denoised
                    count[:, :, h_start:h_end, w_start:w_end] += 1
  
                # take the MultiDiffusion step
                latent = torch.where(count > 0, value / count, value)
  
        # Img latents -> imgs
        imgs = self.decode_latents(latent)  # [1, 3, 512, 512]
        img = T.ToPILImage()(imgs[0].cpu())
        return img
```
作用是根据给定的文本提示(prompts)，将其合成成全景图像。它接收一组提示(prompt)作为输入，将其转换为列表类型。然后，定义全景图像的网格，并获取一个一个图像。接下来，使用随机噪声向量作为输入，通过多步推理生成全景图像的潜变量向量。在推理过程中，使用UNet模型对潜变量向量进行多步推理，并根据提示进行引导，生成不同的全景图像，最后横向拼接所有图像。

```python
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--prompt', type=str, default='a photo of the dolomites')
    parser.add_argument('--negative', type=str, default='')
    parser.add_argument('--sd_version', type=str, default='2.0', choices=['1.5', '2.0'],                       help="stable diffusion version")
    parser.add_argument('--H', type=int, default=512)
    parser.add_argument('--W', type=int, default=4096)
    parser.add_argument('--seed', type=int, default=0)
    parser.add_argument('--steps', type=int, default=50)
    opt = parser.parse_args()
    seed_everything(opt.seed)
  
    device = torch.device('cuda')
  
    sd = MultiDiffusion(device, opt.sd_version)

    img = sd.text2panorama(opt.prompt, opt.negative, opt.H, opt.W, opt.steps)
  
    # save image
    img.save('out.png')
```
这个是从命令行启动的方式，按照argparse的使用方法使用

|参数|含义|
|-|-|
|prompt|提示|
|negative|反面提示|
|sd_version|stable diffusion的版本|
|H|图像的高度|
|W|图像的宽度|
|seed|随机数种子|
|steps|采样步数|
最后的结果会保存为out.png


## 参考文献
[^1]: 关注 R. 却没能成为自己​. (n.d.). _pytorch如何确保 可重复性/每次训练结果相同(固定了随机种子，为什么还不行)？_. 知乎. Retrieved May 9, 2023, from http://zhihu.com/question/345043149/answer/2940838756  
