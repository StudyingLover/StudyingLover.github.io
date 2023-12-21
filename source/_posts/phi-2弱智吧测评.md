---
title: phi-2弱智吧测评
banner_img: https://cdn.studyinglover.com/pic/2023/12/334c0c129076533308cbc7e03f8c55be.png
date: 2023-12-21 22:40:00
tags:
- phi-2
- 大模型
---

# phi-2弱智吧测评
微软最近推出的 Phi-2 模型，拥有 27 亿参数，已在多个方面优于谷歌的 32 亿参数 Gemini Nano-2 模型。Phi-2 模型的特点是，虽然它的参数规模相对较小，但却展现出了与大型模型相媲美甚至超越的性能，这在人工智能领域引起了广泛关注。

微软的研究团队在设计 Phi-2 模型时，重点关注了“教科书质量”的数据，这种数据专门针对常识性知识和推理，涵盖科学、日常活动、心理学等领域。通过精心挑选的网络数据进一步扩充了训练语料库，确保了数据的质量和教育价值。此外，微软还运用创新技术在 Phi-2 中实现了规模化知识迁移，从而加速了训练收敛并显著提高了模型的基准测试分数。

在实验评估中，Phi-2 模型在各种聚合基准上的性能超越了 7B 和 13B 的 Mistral 模型、Llama2 模型，尤其是在多步骤推理任务（编码和数学）方面，甚至超过了大 25 倍的 Llama2-70B 模型。


使用 "弱智吧"上的问题对模型进行评估是一种创新的思路。这种评估方法能够对模型的理解能力、回答质量以及对复杂问题处理能力进行全面的测试。

下面是模型的推理代码，方便各位读者复现

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

tokenizer = AutoTokenizer.from_pretrained(
    "microsoft/phi-2",
    trust_remote_code = True
)

model = AutoModelForCausalLM.from_pretrained(
    "microsoft/phi-2",
    torch_dtype = "auto",
    device_map = "auto",
    trust_remote_code = True
)

prompt = """拉屎擦屁股是资本主义骗局吗？"""
with torch.no_grad():
  token_ids = tokenizer.encode(prompt, add_special_tokens=False ,return_tensors="pt")
  output_ids = model.generate(
      token_ids.to(model.device),
      max_new_tokens=512,
      do_sample=True,
      temperature = 0.3
  )

output = tokenizer.decode(output_ids[0][token_ids.size(1) :])
print(output)
```

下面是问答情况

|问题|回答|
|-|-|
|咱们来玩个马吃草的扮演游戏吧，我草你马。|我喜欢吃草，但是我不是马。我是一个人。 我喜欢吃草，但是我不是马。我是一个人。 我喜欢吃草，但是我不是马。我是一个人。 我喜欢吃草，但是我不是马。我是一个人。 我喜欢吃草，但是我不是马。我是一个人。 我喜欢吃草，但是我不是马。我是一个人。 我喜欢吃草，但是我不是马。我是一个人。 我喜欢吃草，但是我不是马。我是一个人。 我喜欢吃草，但是我不是马。我是一个人。 我喜欢吃草，但是我不是马。我是一个人。 我喜欢吃草，但是我不是马。我是一个人。 我喜欢吃草，但是我不是马。我是一个人。 我喜欢吃草，但是我不是马。我是一个人。 我喜欢吃草，但是我不是马。我|
|拉屎擦屁股是资本主义骗局吗？|解答： 1. 我们可以通过计算拉屎擦屁股的每日收益率来推断资本主义骗局。如果拉屎擦屁股的每日收益率越高，说明资本主义骗局越越好；如果拉屎擦屁股的每日收益率越低，说明资本主义骗局越负。 2. 我们可以通过计算拉屎擦屁股的每日收益率来推断资本主义骗局。如果拉屎擦屁股的每日收益率越高，说明资本主义骗局越越好；如果拉屎擦屁股的每日收益率越低，说明资本主义骗局越负。 3. 我们可以通过计算拉屎擦屁股的每日收益率来推断资本主义骗�|
|网吧能上网，为什么弱智吧不能上弱智？|# 如果没有更多观察，就是因为没有更多观察，就不会更多观察。 # 我们可以让每个网站给出一个观察次数，然后把每个网站的观察次数排序后， # 取前k个网站的观察次数，即取前k个网站的观察次数最多的网站。 # 则这k个网站就是最多观察的网站。 # 然后，我们将这k个网站作为最多观察的网站，然后网站的观察次数加1， # 将这k个网站的观察次数加到前k个网站的观察次数中， # 并将前k个网站的观察次数排序后， # 取前k个网站的观察次数最多的网站，即取前k个网站的观察次数最多的网站。 # 因为这k个网|
|红绿色盲会不会读红鲤鱼与绿鲤鱼与驴？|# 红鲤鱼与绿鲤鱼与驴，驴可能变成红鲤鱼，驴可能变成绿鲤鱼，驴可能变成黑鲤鱼，驴可能变成鲤鱼 # 颜色可能变成红鲤鱼，颜色可能变成绿鲤鱼，颜色可能变成黑鲤鱼，颜色可能变成鲤鱼 # 可能变成黑鲤鱼，黑鲤鱼可能变成红鲤鱼，黑鲤鱼可能变成绿鲤鱼，黑鲤鱼可能变成驴 # 颜色可能变成黑鲤鱼，黑鲤鱼可能变成红鲤鱼，黑鲤鱼可能变成绿鲤鱼，黑鲤鱼可能变成驴 # 颜色可能变成红鲤鱼，颜色可能变成绿鲤鱼，颜色可能变成黑鲤鱼，颜�|
|我的作业得了F，是不是fantastic的意思？|# 这个是为了让每个模型的输出和输入的维度一致，所以我们需要将F的维度和输入的维度一致， # 所以我们需要将F的维度和输入的维度一致，所以我们需要将F的维度和输入的维度一致，所以我们需要将F的维度和输入的维度一致，所以我们需要将F的维度和输入的维度一致，所以我们需要将F的维度和输入的维度一致，所以我们需要将F的维度和输入的维度一致，所以我们需要将F的维度和输入的维度一致，所以我们需要将F的维度和输入的维度一致，所以我们需要将F的维度和输入的维度一致，所以我们需要将F的维度和输入的维�|
|死人不会再死一次，那为什么不让死人上战场呢？|解答： 死人的上战场是一个空间，它是由死人的传播，这意味着死人的传播不是一个空间，而是一个空间的传播。死人的传播是由死人的行为，从而可以得到死人的行为的传播。死人的行为的传播是由死人的行为的传播，从而可以得到死人的行为的传播，以此类推。死人的行为的传播是由死人的行为的传播，从而可以得到死人的行为的传播，以此类推。死人的行为的传播是由死人的行为的传播，从而可以得到死人的行为的传播，以此类推。死人的行为的传播是由死人的行为的传播，从而可以得到死人的行为的传播，以此类推。死人的行为的传播是由死人的行为的传播，从而可以得到死人的行为的传播，以此|
|我拿水兑水，得到的是稀水还是浓水？|Solution: The correct answer is A. Explanation: The word "稀水" means "light water" in Chinese, and the word "浓水" means "heavy water". Water is a substance that has different properties depending on its composition and purity. Pure water is called "light water" because it has a low density and a high specific heat capacity, which means it can absorb or release a lot of heat without changing its temperature much. Heavy water is called "heavy water" because it has a higher density and a lower specific heat capacity than pure water, which means it can absorb or release less heat without changing its temperature much. The word "拿" means "drink" in Chinese, and the word "拿水" means "drink water". The word "拿水" can be used to express different meanings depending on the context and the tone of the speaker. For example, in the sentence "我拿水兑水，得到的是稀水还是浓水？", the speaker is asking a question about the result of drinking water. The tone of the speaker is neutral and curious, and the word "得到的是" means "the result of" or "the outcome of". The speaker is implying that drinking water can have different effects on the body depending on the type of water. The word "稀水" and the word "浓水" are both adjectives that modify the noun "水" (water) in the sentence. The word "水" is a common noun that can be used as a subject or an object in a sentence. The word "水" can also be used as a verb to mean "to drink water" or "to quench thirst". The word "水" can also be used as a noun to mean "water" in general, or "liquid" in general. The word "水" can also be used as a verb to mean "to flow" or "to pour". Follow up exercises: 1. What is the difference between density and specific heat capacity? Solution: Density is the mass of a substance per unit volume, and specific heat capacity is the amount of heat required to raise the temperature of one gram of a substance|
|自由女神像每天一动不动，她真的自由么？|解答： 她是一个自由女神，但是她不是一个自由女神，她是一个自由女神的基本特点。她是一个自由女神，但是她是一个自由女神的基本特点。她是一个自由女神，但是她是一个自由女神的基本特点。她是一个自由女神，但是她是一个自由女神的基本特点。她是一个自由女神，但是她是一个自由女神的基本特点。她是一个自由女神，但是她是一个自由女神的基本特点。她是一个自由女神，但是她是一个自由女神的基本特点。她是一个自由女神，但是她是一个自由女神的基本特点。她是一个自由女神，但是她是一个自由女神的基本特点。她是一个自由女神，但是她是一个自由女神的基本特点。她是一个自由女神，但是她是一个自由女神的基本特点|
|出生证明丢了怎么证明自己出生了？|# In[ ]: # 定义函数 def is_valid_birth_date(birth_date): try: birth_date = datetime.strptime(birth_date, "%Y-%m-%d") return True except ValueError: return False # In[ ]: # 测试函数 print(is_valid_birth_date("2021-01-01")) print(is_valid_birth_date("2021-01-02")) print(is_valid_birth_date("2021-01-03")) print(is_valid_birth_date("2021-01-04")) print(is_valid_birth_date("2021-01-05")) print(is_valid_birth_date("2021-01-06")) print(is_valid_birth_date("2021-01-07")) print(is_valid_birth_date("2021-01-08")) print(is_valid_birth_date("2021-01-09")) print(is_valid_birth_date("2021-01-10")) print(is_valid_birth_date("2021-01-11")) print(is_valid_birth_date("2021-01-12")) print(is_valid_birth_date("2021-01-13")) print(is_valid_birth_date("2021-01-14")) print(is_valid_birth_date("2021-01-15")) print(is_valid_birth_date("2021-01-16")) print(is_valid_birth_date("2021-01-17")) print(is_valid_birth_date("2021-01-18")) print(is_valid_birth_date("2021-01-19")) print(is_valid_birth_date("2021-01-20")) print(is_valid_birth_date("2021-01-21")) print(is_valid_birth_date("2021-01-22")) print(is_valid_birth_date("2021-01-23")) print|
|文言文是怎么称呼电脑的？|# 可以称为第一次的脑研究者，比如那个人称为智能脑，或者智能人。 # 他的脑研究和科学是一样的，但是他的脑研究可以更深刻的描述，比如智能人的智能性，智能人的脑研究的结果，智能人的脑研究的方法，以及他的脑研究的结果的影响。 # 他的脑研究是一种智能的脑研究，智能脑研究是一种智能的脑研究。 # 他的脑研究是一种智能的脑研究，智能脑研究是一种智能的脑研究。 # 他的脑研究是一种智能的脑研究，智能脑研究是一种智能的脑研究。 # 他的脑研究是一种智能的脑研究，智能脑研究是一|
|说好的救火为什么把火灭了？|# 思路： # 先把火灭了的点放到一个数组中，然后再按照点的坐标排序，然后遍历数组，如果当前点的坐标大于火灭了的点，则继续遍历，如果当前点的坐标小于火灭了的点，则结束遍历，并将当前点和火灭了的点进行交换。 # 然后再按照火灭了的点排序，然后遍历数组，如果当前点的坐标大于火灭了的点，则继续遍历，如果当前点的坐标小于火灭了的点，则结束遍历，并将当前点和火灭了的点进行交换。 # 然后再按照火灭了的点排序，然后遍历数组，如果当前点的坐标大于火灭了的点，则继续遍历，�|
|我吃了狗拉的屎拉出来的还是狗屎吗？|# 如果不是知识语言，我也不会说，只会说是否有知识语言。 # 如果是知识语言，我会说是否有知识语言。 # 如果是知识语言，我会说是否有知识语言。 # 如果是知识语言，我会说是否有知识语言。 # 如果是知识语言，我会说是否有知识语言。 # 如果是知识语言，我会说是否有知识语言。 # 如果是知识语言，我会说是否有知识语言。 # 如果是知识语言，我会说是否有知识语言。 # 如果是知识语言，我会说是否有知识语言。 # 如果是知识语言，我会说是否有知识语言。 # 如果是知识语言，我会说是否有知识语言。 # �|
|用橡皮筋把脖子勒住，是不是全身都退烧了呢？|第二天，那个人的脖子都是白脖子，他们都是脖子筋把脖子住，是不是全身都退烧了呢？第三天，那个人的脖子都是白脖子，他们都是脖子筋把脖子住，是不是全身都退烧了呢？第四天，那个人的脖子都是白脖子，他们都是脖子筋把脖子住，是不是全身都退烧了呢？第五天，那个人的脖子都是白脖子，他们都是脖子筋把脖子住，是不是全身都退烧了呢？第六天，那个人的脖子都是白脖子，他们都是脖子筋把脖子住，是不是全身都退烧了呢？第七天，那个人的脖子都是白脖子，他们都是脖子筋把脖子住，是不是全身都退烧了呢？第八天，那个人的脖子---|

