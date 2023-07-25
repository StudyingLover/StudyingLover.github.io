---
title: 快速上手llama2.c
banner_img: https://github.com/karpathy/llama2.c/blob/master/assets/llama_cute.jpg
date: 2023-7-25 16:19:00
tags:
- 踩坑
---
# 快速上手llama2.c
[llama2.c](https://github.com/karpathy/llama2.c.git)一个完整的解决方案，可以使用PyTorch从头开始训练Llama 2 LLM（Lightweight Language Model）模型，并将权重导出为二进制文件，然后加载到一个简单的500行C文件（run.c）中进行推理。另外，你也可以加载、微调和推理Meta的Llama 2模型（但这部分仍在积极开发中）。因此，这个仓库提供了一个"全栈"的训练和推理方案，专注于极简和简洁性。你可能会认为只有拥有数十亿参数的LLM才能实现有用的功能，但事实上，如果领域足够狭窄，非常小的LLM也可以表现出惊人的性能。建议参考TinyStories论文以获得灵感。

需要注意的是，这个项目最初只是一个有趣的周末项目：作者在之前的nanoGPT基础上进行了调整，实现了Llama-2架构而不是GPT-2，并且主要的工作是编写了C推理引擎（run.c）。因此，这个项目还比较年轻，并且在快速发展中。特别感谢llama.cpp项目为此项目提供了灵感。作者希望保持超级简洁，所以选择了硬编码Llama 2架构，采用fp32精度，并仅使用纯C编写一个没有依赖项的推理文件。

首先clone整个仓库并编译
```bash
git clone https://github.com/karpathy/llama2.c.git
cd llama.c
gcc -O3 -o run run.c -lm
```

接下来下载模型
```bash
wget https://karpathy.ai/llama2c/model.bin -P out
```

或者下载更大的一个模型
```bash
wget https://karpathy.ai/llama2c/model44m.bin -P out44m
```

接下来进行推理
```bash
./run out/model.bin
```

我们将会看到这样一段输出就代表运行成功
```
<s>
 One day, a little otter named Ollie went to play in the river. Ollie was very compassionate. He loved to help his friends in the town.
While playing, Ollie saw a big fish. The fish was stuck in the mud. "Help me, please!" said the fish. Ollie wanted to help the fish. He swam away, looking for something to break the mud.
Ollie found a small stick. He used the stick to break the mud. The fish was free! "Thank you, Ollie!" the fish said. The fish was happy and swam away.
Ollie felt good for helping the fish. He went back to play in the river. Ollie knew that helping others made him feel good. And from that day, Ollie was always compassionate to everyone.
<s>
 Tom was a big boy who liked to help his mom. He saw his mom doing laundry and asked if he could join. His mom said yes, but he had to be careful with the iron. The iron was hot and had a button on it.
Tom took the iron and ran to the house. He wanted to iron his shirt
achieved tok/s: 178.148921
```

