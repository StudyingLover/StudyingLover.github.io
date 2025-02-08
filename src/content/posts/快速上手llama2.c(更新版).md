---
title: 快速上手llama2.c(更新版)
banner_img: https://github.com/karpathy/llama2.c/blob/master/assets/llama_cute.jpg
date: 2023-7-28 16:31:00
tags:
- 踩坑
---
# 快速上手llama2.c(更新版)
在上一次我同时在我的博客和知乎发布了[快速上手llama2.c](https://studyinglover.com/2023/07/25/%E5%BF%AB%E9%80%9F%E4%B8%8A%E6%89%8Bllama2.c/) 之后，我一个小透明也收获了不少收藏，并收到了人生中第一个这样的留言(其实我感觉是机器人)。
![](https://cdn.studyinglover.com/pic/2023/07/2eda3b2dcb8d68fc01169f5366c8157c.jpg)

当然，之前的llama2.c也有一些不好的地方，例如不能添加自己的prompt,所以我提了这样的一个[issue](https://github.com/karpathy/llama2.c/issues/64),今天收到了贡献者的回复说是可以用了。那我们来看一下。

首先还是克隆整个仓库，编译并下载模型，这里以15m参数的模型作为示例
```bash
git clone https://github.com/karpathy/llama2.c.git
cd llama2.c
make run
wget https://huggingface.co/karpathy/tinyllamas/resolve/main/stories15M.bin
```

接下来我们就可以使用编译出来的`run` 运行了,要使用自己的prompt,需要指定温度和 步长，这里温度设置成1.0,步长设置256,prompt在双引号写，我这里写的是`One day morning , I don't want to go to school` .
```bash
./run stories15M.bin 1.0 256 "One day morning , I don't want to go to school"
```

这里给出我的运行结果，也就3秒种不到
```
<s>
One day morning , I don't want to go to school, so he packed his trunk lid to pack. memorized his chores, he thought about what his mom would like him to stay home and not do all day. She wanted him to in a very competitive way.
"Come and play in the puddle, it'll be more fun!"He begged.
Mom shook her head. "No, we haven't seen coming for sure," she said thought. 
Thumper and Mom just shrugged.
"See," she said. "Come on now. Let's go and find some fun ways to clean the world!"
The little boy was relieved and ran out to the yard. He had found a great idea to share his day with his mom instead. They scattered around the yard and had fun playing until their tired eyes were aching.
<s>
Once upon a time, there was a little boy named Tim. Tim was very excited because he was going on a trip with his family. He saw a big bus that helped them get off at their destination.
As the bus drove along, Tim noticed an unusual looking man sitting next to it. Tim asked the
achieved tok/s: 175.378267

```

当然为了获得更好的效果，我们可以使用更大模型

下载42m参数模型
```bash
wget https://huggingface.co/karpathy/tinyllamas/resolve/main/stories42M.bin
```

下载110m参数模型
```bash
wget https://huggingface.co/karpathy/tinyllamas/resolve/main/stories110M.bin
```