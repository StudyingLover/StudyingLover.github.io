---
title: speculative-sampling笔记
banner_img: https://cdn.studyinglover.com/pic/2023/09/d5ca60e13944b8fb7e33e289bdc411d3.png
index_img: https://cdn.studyinglover.com/pic/2023/09/5867fc09bb99e8709725e0813d4ad7cf.png
date: 2023-9-5 19:40:00
categories:
- 笔记
tags:
- 自然语言处理
---
# speculative-sampling笔记
speculative-sampling,投机采样是一种加速llm推理的方法。

论文[arxiv](https://arxiv.org/abs/2302.01318) ,参考博客[jaykmody.com](https://jaykmody.com/blog/speculative-sampling/)

这个方法需要用到两个模型，一个小模型，称为 draft model，一个大模型，称为target model。

speculative-sampling使用了一种直觉，对于一些序列下一个token预测是i很明显的，小模型也可以完成。因此，如果draft model和target model在给定的很明显的序列上的分布之间存在很强的一致性，那么就允许targrt model被调用时一次输出多个token

![image.png](https://cdn.studyinglover.com/pic/2023/09/a74b5ced4e8f8945acc8cf6b4fbbdfb7.png)
自回归采样，就是说给一个序列模型预测下一个token。

![image.png](https://cdn.studyinglover.com/pic/2023/09/5867fc09bb99e8709725e0813d4ad7cf.png)
对于大模型来说，主要是三个部分拖慢了推理速度，线性层，注意力机制和通信。

拒绝采样的公式被修改为$$\min\left(1,\frac{q(\tilde{x}_{n+1}|x_1,\ldots,x_n)}{p(\tilde{x}_{n+1}|x_1,\ldots,x_n)}\right)$$
给定一个序列$x_0,\ldots,x_t$ 和一个$K$ ,用draft model先采样$\tilde{x}_t\sim p(x|,x_1,\ldots,x_n,\tilde{x}_1,\ldots,\tilde{x}_{t-1})$ ，循环$K$词

然后并行计算$q(x|,x_1,\ldots,x_n),~q(x|,x_1,\ldots,x_n,\tilde{x}_1),~\ldots,~q(x|,x_1,\ldots,x_n,\tilde{x}_1,\ldots,\tilde{x}_K)$ 

采样一个$r\sim U[0,1]$ ,如果$r<\min\left(1,\frac{q(x|x_1,...,x_{n+t-1})}{p(x|x_1,...,x_{n+t-1})}\right)$  就把${\tilde{x}_t}$ 拼到序列$x_{n+t-1}$ 后面，这里的$n$ 是序列长度。

如果$\tilde{x}_{n+1}$ 被拒绝了，也就是说$r>\min\left(1,\frac{q(x|x_1,...,x_{n+t-1})}{p(x|x_1,...,x_{n+t-1})}\right)$,那么就直接按照$x_{n+1}\sim(q(x|x_1,\ldots,x_n)-p(x|x_1,\ldots,x_n))_+$采样一个$x_{n+1}$ 

$(.)_{+}$ 被定义为$$(f(x))_+=\frac{\max(0,f(x))}{\sum_x\max(0,f(x))}$$
如果所有的token都被接受了，那就再采样一个拼到序列后面，然后结束。

使用标准采样方法，如核、top-k 采样和调整温度，可以在应用这种拒绝采样方案之前相应地修改概率。作者观察到整体接受率对使用的确切参数具有鲁棒性。

因为speculative-sampling没有改变transformer的结构，所以**可以和其他方法结合使用** ,例如量化，multi-query attention。

在选择draft model方面，可以简单地使用较小版本的目标语言模型作为草稿并获得较高的接受率。从工程和工作流程的角度来看，这也很方便，因为应该首先存在对此类模型的稳健工具来训练目标模型。