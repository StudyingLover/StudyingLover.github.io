---
title: colab运行google最新开源模型Gemma
banner_img: https://cdn.studyinglover.com/pic/2024/02/e770e5ca6a8c87a9367efda0d48f306b.png
index_img: https://cdn.studyinglover.com/pic/2024/02/e770e5ca6a8c87a9367efda0d48f306b.png
date: 2024-2-22 14:00:00
categories:
- 笔记
tags:
- Gemma
- Google
- 大模型
---

Google开源了新的大模型 [Gemma](https://blog.google/technology/developers/gemma-open-models/) ，[Gemma](https://ai.google.dev/gemma/?utm_source=keyword&utm_medium=referral&utm_campaign=gemma_cta&utm_content=)是一系列轻量级、最先进的开放式[模型，](https://opensource.googleblog.com/2024/02/building-open-models-responsibly-gemini-era.html)采用与创建[Gemini](https://deepmind.google/technologies/gemini/#introduction)模型相同的研究和技术而构建。Gemma 由 Google DeepMind 和 Google 的其他团队开发，其灵感来自 Gemini，其名称反映了拉丁语_gemma_，意思是“宝石”。除了模型权重之外，我们还发布了工具来支持开发人员创新、促进协作并指导负责任地使用 Gemma 模型。


Gemma 是为推动人工智能创新的开发人员和研究人员的开放社区而构建的。您今天就可以开始与 Gemma 合作，使用 Kaggle 中的免费访问权限、Colab 笔记本的免费套餐以及首次使用 Google Cloud 用户的 300 美元积分。研究人员还可以申请高达 50 万美元的[Google Cloud 积分来加速他们的项目。](https://docs.google.com/forms/d/e/1FAIpQLSe0grG6mRFW6dNF3Rb1h_YvKqUp2GaXiglZBgA2Os5iTLWlcg/viewform)

google提供了keras3.0来提供跨所有主要框架的推理和监督微调 (SFT) 工具链：JAX、PyTorch 和 TensorFlow 。还有 即用型[Colab](http://ai.google.dev/gemma/docs/get_started)和[Kaggle 笔记本](https://www.kaggle.com/models/google/gemma/code)，以及与[Hugging Face](http://huggingface.co/google)、[MaxText](https://github.com/google/maxtext)、[NVIDIA NeMo](https://github.com/NVIDIA/GenerativeAIExamples/tree/main/models/Gemma)和[TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM)等流行工具的集成，让您可以轻松开始使用 Gemma。

google也提供了一个快速指南来使用[ai.google.dev/gemma](http://ai.google.dev/gemma) 

## kaggle 获取访问权限
首先访问[Gemma在kaggle的页面](https://www.kaggle.com/models/google/gemma)，登陆你的kaggle账号

![image.png](https://cdn.studyinglover.com/pic/2024/02/e770e5ca6a8c87a9367efda0d48f306b.png)

这里会有一个 Request Access,点击(我这是已经有访问权限了，你点了之后也变成这样说明就成功了)

然后我们点击kaggle的设置，按照我的截图依次点击
![image.png](https://cdn.studyinglover.com/pic/2024/02/0676b9c3968534cf2f0a24fc3efa121e.png)

![image.png](https://cdn.studyinglover.com/pic/2024/02/d31235cf85326598d78a01d3d2a179c3.png)
![image.png](https://cdn.studyinglover.com/pic/2024/02/ee052cc9137ba36a42f363d492108f73.png)
你的浏览器会下载一个json文件，例如就像下面这样
![image.png](https://cdn.studyinglover.com/pic/2024/02/8c67107479ef55d6358110e4d46778fb.png)

## colab运行
如果你有google账号那就直接打开[Gemma的colab页面](https://colab.research.google.com/github/google/generative-ai-docs/blob/main/site/en/gemma/docs/lora_tuning.ipynb?utm_source=agd&utm_medium=referral&utm_campaign=open-in-colab&hl=zh-cn) (没有的话就注册一个啦)

不出意外你会看到这样一个页面
![image.png](https://cdn.studyinglover.com/pic/2024/02/7fc668b963da87075d5e3a2eab1f125a.png)

接下来点击右上角，按照我的截图顺序，选择显卡为t4
![image.png](https://cdn.studyinglover.com/pic/2024/02/c5836766b7819385e337ce5877114a5b.png)
![image.png](https://cdn.studyinglover.com/pic/2024/02/ded1ab56213ab089e2347ee0729ffab3.png)

![image.png](https://cdn.studyinglover.com/pic/2024/02/15fdbd16664eb511e1ec7c5653e267b8.png)
点击保存，等待右上角变成这样，代表成功
![image.png](https://cdn.studyinglover.com/pic/2024/02/5660f6ffaf4ce5a8e49f37753875194a.png)




接下来点击左侧
![image.png](https://cdn.studyinglover.com/pic/2024/02/6ef657aa2cb9c7becdc67cdcc2dbc20d.png)

选择新建新密钥
![image.png](https://cdn.studyinglover.com/pic/2024/02/c8f82c0c604a443f5af650b74f069e8b.png)
先添加一个叫做 KAGGLE_USERNAME， 值写我们刚下载的json里面的username字段对应的值，

举个例子,加入我们下载的json是这样，那就填入的是example_username
```json
{"username":"example_username","key":"12345678901112131415"}
```
![image.png](https://cdn.studyinglover.com/pic/2024/02/89f8465de454aa8118ed3cf6cd0c6a3c.png)
再添加一个KAGGLE_KEY，值填写的是key对应的值，在刚才的例子那就是写12345678901112131415

![image.png](https://cdn.studyinglover.com/pic/2024/02/2879bf0a0d806662d496fb33562a6a58.png)

记着打开两个的访问权限
## 运行colab
运行notebook即可，就是点击这里的开始按钮就会执行这个小方格里的代码
![image.png](https://cdn.studyinglover.com/pic/2024/02/b9bd6ed422800307321d8f7a0afa18b6.png)

里面有推理和微调的示例，感兴趣的同学可以自己实践

## 评测
我这边运行了几个2b模型的例子，效果是实话实说，emmmmmmmmmmmm,一言难尽，可能是2b太拉胯了吧
![image.png](https://cdn.studyinglover.com/pic/2024/02/a756dd4d922af5b0f45b40cdd649f646.png)
