---
title: MediaPipe即将推出图像生成服务
banner_img: https://cdn.studyinglover.com/pic/2023/08/b744863d78b3347dc0cfb23c7a0cd29d.png
index_img: https://cdn.studyinglover.com/pic/2023/08/b744863d78b3347dc0cfb23c7a0cd29d.png
date: 2023-8-23 20:42:00
---
# MediaPipe即将推出图像生成服务
今天我逛GitHub Trending的时候突然发现MediaPipe的示例库被顶到了前排
![image.png](https://cdn.studyinglover.com/pic/2023/08/0bc3379fab3273262e8b6f14799b629a.png)

这不对劲，我赶紧去mediapipe的储存库，发现7个小时前Google推送了新的内容  [ImageGenerator Java API](https://github.com/google/mediapipe/commit/2ebdb01d4326c934e0628e7ff45cadda6575d23f) 
![image.png](https://cdn.studyinglover.com/pic/2023/08/b744863d78b3347dc0cfb23c7a0cd29d.png)

原来MediaPipe也要推出文字生成图片内容啊，还是移动端设备上的，这让我想起来GitHub最近有人开始写stable-diffusion.cpp，一个使用了ggml量化加速的sd。

顺藤摸瓜我们可以找到MediaPipe的[文档](https://developers.google.com/mediapipe/solutions/vision/image_generator)。
![image.png](https://cdn.studyinglover.com/pic/2023/08/6c50982c58e1d65562e230b0bb601d15.png)

还是即将推出状态，但是给了一个简单示例。

用法超级简单，就是下载下面几个模型中的一个
- [runwayml/stable-diffusion-v1-5](https://huggingface.co/runwayml/stable-diffusion-v1-5/blob/main/v1-5-pruned-emaonly.ckpt)
- [justinpinkney/miniSD](https://huggingface.co/justinpinkney/miniSD/blob/main/miniSD.ckpt)
- [hakurei/waifu-diffusion-v1-4](https://huggingface.co/hakurei/waifu-diffusion-v1-4/blob/main/models/wd-1-3-penultimate-ucg-cont.ckpt)
- [Fictiverse/Stable_Diffusion_PaperCut_Model](https://huggingface.co/Fictiverse/Stable_Diffusion_PaperCut_Model/blob/main/PaperCut_v1.ckpt)

安装依赖
```bash
pip install torch typing_extensions numpy Pillow requests pytorch_lightning absl-py
```
把这个文件copy下来,[地址](https://github.com/googlesamples/mediapipe/blob/main/tools/image_generator_converter/convert.py)

然后
```bash
python3 convert.py --ckpt_path <ckpt_path> --output_path <output_path>
```

接着将文件夹内容`<output_path>`推送到 Android 设备。
```bash
adb shell rm -r /data/local/tmp/image_generator/ 

adb shell mkdir -p /data/local/tmp/image_generator/

adb push <output_path>/. /data/local/tmp/image_generator/bins
```
安装 Android 演示应用程序,在[这里](https://storage.googleapis.com/mediapipe-tasks/image_generator/imagegenerator.apk)下载
```bash
adb install imagegenerator.apk
```
