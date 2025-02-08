---
title: npc_gzip笔记
banner_img: https://cdn.studyinglover.com/pic/2023/07/9482f9fe9617825162494635a1b7f460.jpg
date: 2023-7-18 16:57:00
categories:
- 自然语言处理
---
# npc_gzip笔记
## 论文笔记
npc_gzip 的论文名叫做 "Low-Resource" Text Classification: A Parameter-Free Classification Method with Compressors ,意为不需要参数，使用压缩器的文本分类方法。论文的代码也只有仅仅的十四行，就在部分数据集上取得了超越 __bert__ 的效果。

npc_gzip由一个无损压缩器，一个基于距离的度量函数和K近邻算法组成。

使用压缩器进行分类的直觉是有两方面
1. 压缩器擅长捕捉规律性；  
2. 来自同一类别的对象比不同类别的对象具有更多的规律性。

假设$x_1$, $x_2$ 属于相同的类别，$x_3$ 属于不同的类别，用$C(\cdot)$ 代表压缩器， 我们会发现$C\left(x_1 x_2\right)-C\left(x_1\right)<C\left(x_1 x_3\right)-C\left(x_1\right)$  , $C\left(x_1 x_2\right)$ 代表 x1 和 x2 的串联的压缩长度。换句话说$C\left(x_1 x_2\right)$ 可以解释为我们仍然需要根据 x1 的信息对 x2 进行编码多少字节：
```
x1 = Japan's Seiko Epson Corp. has developed a 12-gram flying microrobot.

x2 = The latest tiny flying robot has been unveiled in Japan.

x3 = Michael Phelps won the gold medal in the 400 individual medley.
```

这种直觉可以形式化为源自 Kolmogorov 复杂度的距离度量。Kolmogorov 复杂度 K(x) 表征了可以生成 x 的最短二进制程序的长度。K(x) 理论上是信息测量的最终下限。

$$\begin{aligned} E(x, y) & =\max \{K(x \mid y), K(y \mid x)\} \\ & =K(x y)-\min \{K(x), K(y)\}\end{aligned}$$

由于 Kolmogorov 复杂度的可计算性质使得 E(x,y) 不可计算，所以可以使用归一化压缩距离 (NCD)，利用压缩长度 C(x) 来近似 Kolmogorov 复杂度 K(x)。形式上是$$N C D(x, y)=\frac{C(x y)-\min \{C(x), C(y)\}}{\max \{C(x), C(y)\}}$$
使用压缩长度背后的直觉是压缩器最大压缩的 x 的长度接近 K(x)。一般来说，压缩比越高，C(x)越接近K(x)。

实验的结果使用 gzip 作为压缩器，这里的$C(x)$ 表示 gzip 压缩后 x 的长度。$C(xy)$ 是 x 和 y 的串联的压缩长度。NCD 提供距离矩阵使用 k-最近邻来执行分类。

核心代码真的真的就非常简单了
```python
import gzip2 
import numpy as np
for ( x1 , _ ) in test_set :
	Cx1 = len ( gzip . compress ( x1 . encode () ) )
	distance_from_x1 = []
	for ( x2 , _ ) in training_set :
		Cx2 = len ( gzip . compress ( x2 . encode () )
		x1x2 = " " . join ([ x1 , x2 ])
		Cx1x2 = len ( gzip . compress ( x1x2 . encode () )
		ncd = ( Cx1x2 - min ( Cx1 , Cx2 )) / max ( Cx1 , Cx2 )
		distance_from_x1 . append ( ncd )
		sorted_idx = np . argsort ( np . array ( distance_from_x1 ) )
	top_k_class = training_set [ sorted_idx [: k ] , 1]
	predict_class = max ( set ( top_k_class ) , key = top_k_class . count )
```

这种方法是 DNN 的简单、轻量级和通用的替代方案。很简单，因为它不需要任何预处理或训练。它的轻量级在于它不需要参数或 GPU 资源进行分类。由于压缩器是数据类型不可知的，非参数方法不会带来潜在的假设。

## 代码实践
作者在GitHub上开源了他的代码 [npc_gzip](https://github.com/bazingagin/npc_gzip) .我们先把代码拉到本地
```bash
git clone https://github.com/bazingagin/npc_gzip
```
接下来安装依赖项，有条件的话创建一个虚拟环境
```bash
cd ./npc_gzip
pip install -r requirements.txt
```

安装完了之后运行`main_text.py`
```bash
python main_text.py
```

注意，如果你遇到了这个问题
```
Traceback (most recent call last):
  File "main_text.py", line 2, in <module>
    from data import *
  File "/home/npc_gzip/data.py", line 12, in <module>
    from datasets import load_dataset
  File "/home/.conda/envs/npc_gzip/lib/python3.7/site-packages/datasets/__init__.py", line 43, in <module>
    from .arrow_dataset import Dataset
  File "/home/.conda/envs/npc_gzip/lib/python3.7/site-packages/datasets/arrow_dataset.py", line 59, in <module>
    from huggingface_hub import HfApi, HfFolder
  File "/home/.conda/envs/npc_gzip/lib/python3.7/site-packages/huggingface_hub/__init__.py", line 322, in __getattr__
    submod = importlib.import_module(submod_path)
  File "/home/.conda/envs/npc_gzip/lib/python3.7/importlib/__init__.py", line 127, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
  File "/home/.conda/envs/npc_gzip/lib/python3.7/site-packages/huggingface_hub/hf_api.py", line 32, in <module>
    import requests
  File "/home/.conda/envs/npc_gzip/lib/python3.7/site-packages/requests/__init__.py", line 43, in <module>
    import urllib3
  File "/home/.conda/envs/npc_gzip/lib/python3.7/site-packages/urllib3/__init__.py", line 42, in <module>
    "urllib3 v2.0 only supports OpenSSL 1.1.1+, currently "
ImportError: urllib3 v2.0 only supports OpenSSL 1.1.1+, currently the 'ssl' module is compiled with 'OpenSSL 1.0.2u  20 Dec 2019'. See: https://github.com/urllib3/urllib3/issues/2168
```

urllib3 v2.0（您安装的版本）需要 OpenSSL 1.1.1+ 才能正常工作，因为它依赖于 OpenSSL 1.1 的一些新功能.

安装旧版本即可解决
```bash
pip install urllib3==1.26.6 
```