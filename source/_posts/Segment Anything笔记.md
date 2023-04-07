---
title: Segment Anything笔记
banner_img: https://drive.studyinglover.com/api/raw/?path=/photos/blog/background/1679396994125.png
date: 2023-4-7 21:40:00
categories:
- 笔记
tags:
- 图像分割
- 多模态
---
# Segment Anything笔记
Segment Anything project是一个用于图像分割的新任务、模型和数据集。在他刚出来的那一天，知乎等平台就已经高呼CV已死。为了这个项目，作者创建了迄今为止最大的分割数据集，1100万张在10亿次授权且尊重隐私的图像上的数据集。模型也被设计和训练成了promptable,就是说可以给他一些提示。作者在多个数据集测试了他的结果并认为结果令人满意。

![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230407073917.png)


代码开源[GitHub](https://github.com/facebookresearch/segment-anything)

项目地址[https://segment-anything.com/](https://segment-anything.com/)

## 引言
作者在引言中讨论了NLP工作中prompt的巨大作用，并回顾了视觉领域多模态的重要工作CLIP和ALIGN，最后说明了他们的目标和工作。

首先，在网络上经过预训练的大型语言模型凭借其强大的zero-shot和few-shot能力革新NLP，prompt的引入使得这些模型zero-shot和few-shot性能与微调模型出奇的好。经验趋势表明，这种行为随着模型规模、数据集大小和总训练计算的增加而改善。

CLIP和ALIGN使用对比学习来训练对齐两种模态的文本和图像编码器。经过训练后，prompt可以实现对新视觉概念和数据分布的zero-shot概括。这种编码器还与其他模块有效组合，以实现下游任务，如图像生成（例如，DALL·E）。虽然在视觉和语言编码器方面已经取得了很大进展，但计算机视觉包括了超出这一范围的广泛问题，而且对于其中许多问题，还不存在丰富的训练数据。

作者提到在这项工作中，他们的目标是建立一个图像分割的基础模型。也就是说，他们在寻求开发一个可提示的模型，并使用能够实现强大泛化的任务在广泛的数据集上对其进行预训练。有了这个模型，他们的目标是使用即时工程解决新数据分布上的一系列下游分割问题。

这个计划的成功取决于三个组成部分：任务、模型和数据。为了开发它们，作者解决了以下关于图像分割的问题：
1. 什么样的样本可以实现零样本泛化
2. 相应的模型架构是什么
3. 什么样的数据可以支撑这个人物和模型

这些问题错综复杂，作者首先定义了一个promptable的分割任务，这可以提供强大的预训练目标，并且有广泛的下游任务可以应用。这个任务需要一个支持灵活的prompt的模型并且可以输出分割结果。为了训练这个模型，作者需要一个多样性的，大型的数据集，因此作者构建了一个数据引擎，使用高效的模型进行迭代。作者介绍了每个组件然后是创建的数据集和有效性的实验。

## 任务
作者从NLP领域获得灵感，在NLP的任务中，预测下一个token用于基础模型的训练，并通过prompt engineering 解决不同的下游任务。为了建立这样一个分割的基础模型，作者的目标书建立一个具有类似能力的任务
### Task 
promptable的分割任务是给定任何prompt都能返回有效的分割掩码。有效的mask意味着即使prompt是不准确的或者涉及到多个对象的也应该的能够输出正确的或者合理的掩码。如图所示，每列显示SAM从单个不明确的点提示生成的3个有效掩码。
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230407194759.png)

### 预训练
promptable segmentation task 提出了一种自然的预训练算法，该算法模拟每个训练样本的提示序列（例如，点、框、掩码），并将模型的掩码预测与基本事实进行比较。作者将这种方法从交互式分割中改编出来，尽管与交互式分割不同，交互式分割的目的是在足够的用户输入后最终预测有效的掩码，但promptable segmentation task 的目的是始终预测任何提示的有效掩码，即使提示不明确的/错误的/荒谬的。

### Zero-shot 推理
直观地说，预训练任务赋予了模型在推理时对任何提示做出适当响应的能力，因此下游任务可以通过设计适当的提示来解决。一般来说，一系列实用的分割任务可以作为提示。除了自动数据集标记外，作者还在第7部分中的实验中探索了五个不同的示例任务。
## 模型
SAM包括了三个部分 一个 image encoder, 一个 flexible prompt encoder, 和一个 fast mask decoder.
![image.png](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230407203046.png)

### image encoder 
受可扩展性和强大的预训练方法的启发，作者使用了MAE预训练的视觉转换器（ViT），该转换器至少适用于处理高分辨率输入。图像编码器每个图像运行一次，并且在prompt运行之前运行

### prompt encoder 
作者考虑了两组提示：稀疏(sparse)（点、框、文本）和密集(dense)（掩码）。MAE通过位置编码来表示点和框，这些位置编码与每个使用CLIP的现成文本编码器来编码过的prompt的学习嵌入相加。dense prompt（即掩码）使用卷积嵌入，并与图像嵌入逐元素求和。

### mask decoder 
掩码解码器有效地将图像嵌入、提示嵌入和输出标记映射到掩码。这种设计受到的启发，对 Transformer decoder 进行了修改，然后是动态掩码预测头。修改后的解码器块在两个方向上使用提示自注意力和交叉注意力（(prompt-to-image embedding，反之亦然）来更新所有嵌入。在运行两个块后，对图像嵌入进行上采样，MLP将输出标记映射到动态线性分类器，然后计算每个图像位置的mask foreground 概率。

## Data engine 
由于分割掩码在互联网上并不丰富，作者构建了一个数据引擎来实现1.1B 掩码数据集 SA-1B 的集合。

数据引擎分为三个阶段：（1）模型辅助手动注释阶段，（2）混合自动预测掩码和模型辅助注释的半自动阶段，以及（3）全自动阶段， 

### 手动阶段
在第一阶段，类似于经典的交互式分割，一组专业注释者通过使用由 SAM 驱动的基于浏览器的交互分割工具点击前景/背景对象点来标记掩码。可以使用像素精确的“刷”和“擦除”工具来细化掩码。模型辅助注释直接在浏览器内实时运行（使用预先计算的图像嵌入），从而实现真正的交互体验。标注不受语义约束，可以自由地标注"stuff" and "things" 

**注释者被要求按突出顺序标记对象，一旦掩码需要超过 30 秒进行注释，便鼓励继续下一个图像。**

在SOTA之后，SAM就开始使用公共数据集进行训练，在经过了足够多的数据标注后，就用新标注的数据重新训练。随着收集更多的掩码，图像使用了ViT-H作为编码器。这样的模型训练一共进行了六次。随着模型的改进，每个掩码的平均注释时间从 34 秒减少到 14 秒。随着SAM的改进，每张图像的平均掩码数从20个掩码增加到44个掩码。总体而言，作者在这个阶段从 120k 张图像收集了 4.3M 掩码。

### 半自动化阶段
这个阶段的目标是增加mask的多样性。为了将标记集中在不太突出的对象上，首先自动检测confident masks。然后向注释者展示了用这些掩码预先填充的图像，并要求他们注释任何额外的未注释对象。为了检测confident masks，作者使用通用的“对象”类别在所有第一阶段掩码上训练了一个边界框检测器。在这个阶段，作者在 180k 图像中收集了一个额外的 5.9M 掩码（总共 10.2M 掩码）。在第一阶段，在新收集的数据（5 次）上定期重新训练模型。每个掩码的平均注释时间可以回到了到 34 秒（不包括自动掩码），因为这些对象对标签更具挑战性。每张图像的平均掩码数从 44 个掩码到 72 个掩码（包括自动掩码）。

### 全自动化阶段
在最后的阶段，注释是全自动的。由于模型已经获得两个主要的增强，所以这是可行的。首先，在这个阶段的开始，作者收集了足够的掩码来极大地改进模型，包括来自前一阶段的不同掩码。其次，在这个阶段，作者开发了歧义感知模型，它允许即使在模棱两可的情况下预测有效的掩码。具体来说，作者使用32×32规则网格点提示模型，对于每个点预测一组可能对应于有效对象的掩码。使用歧义感知模型，如果一个点位于部分或子部分，模型将返回子部分、部分和整个对象。模型的 IoU 预测模块用于选择自信的掩码；此外，模型识别和只选择稳定的掩码（如果阈值 0.5 - δ 的概率图和 0.5 + δ 会导致相似的掩码，就认为掩码是稳定的）。最后，在选择自信稳定的掩码后，会应用非最大抑制 (NMS) 来过滤重复项。为了进一步提高较小掩模的质量，作者还处理了多个重叠的放大图像作物。全自动掩码生成应用于数据集中的所有 11M 图像，总共产生了 1.1B 的高质量掩码。

## 数据集
SA的数据集使用data engine 构建的多样的高分辨率的有隐私保护的图像和1.1B个掩码组成。作者发布了这个这个数据集来帮助未来计算机视觉基础模型。SA-1B 将在某些研究用途的有利许可协议下发布，并为研究人员保护。
### 图像
作者团队从直接与摄影师一起工作的提供商那里获得了一组新的高分辨率的11M图像。即使在下采样之后，这些图像的分辨率也明显高于许多现有的视觉数据集

### 掩码
数据引擎产生了 1.1B 掩码，其中 99.1% 是全自动生成的。因此，自动掩码的质量至关重要。作者团队将这些mask与专业标记的数据集进行标记，发现自动掩码对于训练模型是高质量和有效的。受这些发现的启发，SA-1B 仅包含自动生成的掩码。

>To estimate mask quality, we randomly sampled 500 images (∼50k masks) and asked our professional annotators to improve the quality of all masks in these images. Annotators did so using our model and pixel-precise "brush" and "eraser" editing tools. This procedure resulted in pairs of automatically predicted and professionally corrected masks. We computed IoU between each pair and found that 94% of pairs have greater than 90% IoU (and 97% of pairs have greater than 75% IoU). For comparison, prior work estimates inter-annotator consistency at 85-91% IoU [44, 60]. Our experiments in §7 confirm by human ratings that mask quality is high relative to a variety of datasets and that training our model on automatic masks is nearly as good as using all masks produced by the data engine.
## Responsible AI

## Zero-Shot推理实验
作者在这里讨论了五个任务，其中四个与训练数据完全不同。这也避免了模型训练过程中能够看到答案。这几个任务分别是
1. zero-shot单点有效掩码评估
2. 执行边缘检测
3. 分割所有内容，即对象提议生成
4. 分割检测到的对象，即实例分割， 
5. 作为概念验证，从自由形式的文本中分割对象。

## 讨论
自机器学习的早期以来，预训练模型已经适应下游任务。近年来，随着对规模的日益重视，这种范式变得越来越重要，并且此类模型最近被称为为“基础模型”，即"大规模在广泛的数据上训练并适应广泛的下游任务"

作者的工作是与此高度相关的，尽管分割只是计算机视觉任务的一个子集。作者还将他们的方法的一个方面与另一项工作进行了对比[Rishi Bommasani, Drew A Hudson, Ehsan Adeli, Russ Altman, Simran Arora, Sydney von Arx, Michael S Bernstein, Jeannette Bohg, Antoine Bosselut, Emma Brunskill, et al. On the opportunities and risks of foundation models. arXiv:2108.07258, 2021. 1, 12](https://arxiv.org/abs/2108.07258)，# On the Opportunities and Risks of Foundation Models强调了自监督学习在基础模型中的作用。虽然SA模型是用自监督技术(MAE)初始化的，但它的绝大多数能力来自于大规模的监督训练。在数据引擎可以扩展可用注释的情况下，监督训练提供了一种有效的解决方案。

SA不可避免地也有一些局限性，SAM是为通用性和使用广度而设计的，不同于以往的很多工作，它不是高IoU交互式分割。虽然SAM可以执行许多任务，但目前尚不清楚如何设计简单的提示符来实现语义和全景分割。最后，还有一些领域特定的工具，它们在各自的领域中依然有希望优于SAM。

总而言之，Segment Anything项目是将图像分割提升到基础模型时代的一种尝试。这项工作的主要贡献是一个新的任务(提示分割)，模型(SAM)和数据集(SA-1B)，使这一飞跃成为可能。SAM是否达到了基础模型的地位，仍然要看它在社区中是如何使用的，但这项工作的前景，超过1B个掩模的发布，以及作者的快速分割模型将有助于铺平前进的道路。