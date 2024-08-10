---
title: pydantic实现的LLM ReAct
excerpt: Learn to how to use pydantic to implement LLM ReAct with detailed guides and scripts on StudyingLover's blog.
banner_img: https://opengraph.githubassets.com/205b842766ab7964be2914a777ebec11a0b407d51163268fc1faf62b51edc881/StudyingLover/learn-llm-ReAct
date: 2023-4-27 19:36:00
tags:
  - 大模型
  - LLM
---

在今天的 AI 项目中，大模型的集成几乎成为了一种常态，但如何在保证输出的可控性和解释性的同时利用这些模型执行各种下游任务，一直是一个技术挑战。本文将介绍一个名为 ReAct 的系统，该系统通过结合大规模语言模型的输出与 Python 开发紧密合作，提供了一种新颖的解决方案。

代码开源在[GitHub](https://github.com/StudyingLover/learn-llm-ReAct)

### 什么是 ReAct？

ReAct（推理与行动）是一个增强大型语言模型（LLM）能力的框架，通过结合推理和基于行动的响应来实现。这种方法使 LLM 能够同时生成语言推理轨迹和特定任务的行动，从而提高它们在决策任务中的互动性和有效性

ReAct 的核心在于**思考-行动-观察周期**：在执行期间，LLM 遵循思考、行动和观察的循环：

- **思考**：模型生成关于手头任务的思考或推理轨迹。这可能涉及分解问题、规划搜索策略或做出假设。
- **行动**：基于思考，模型采取特定行动，例如查询数据库、搜索互联网或进行计算。
- **观察**：模型观察行动的结果，这将指导其下一步行动。这可能涉及分析检索到的数据或根据新信息优化搜索【23†来源】。

### 具体实现案例

考虑一个场景，我有两只狗，一只边境牧羊犬和一只苏格兰梗犬。我知道他们各自的体重，那它们的总体重是多少？

我们首先需要两个函数，一个获取一只狗的体重，一个计算数学表达式

```python
def calculate(what):
    return eval(what)


def average_dog_weight(name):
    if name in "Scottish Terrier":
        return "Scottish Terriers average 20 lbs"
    elif name in "Border Collie":
        return "a Border Collies average weight is 37 lbs"
    elif name in "玩具贵宾犬":
        return "玩具贵宾犬的平均体重为 7 磅"
    else:
        return "An average dog weights 50 lbs"
```

我们需要一个 system prompt 来定义 llm 的行为

```python
system_prompt = f"""
你是一个结构化数据的处理器,你精通json格式的数据,并且可以输出结构化的json数据。你可以根据给定的文字和json scheme,输出符合scheme的json数据。请注意,你的输出会直接被解析,如果格式不正确,会导致解析失败,你会被狠狠地批评的。
"""
```

一个 ReAct prompt 来告诉 llm 怎么做

```python
react_prompt = f"""
你在一个思考、行动、暂停、观察的循环中运行。

你可用的操作是：

1. 计算：
例如计算：4 * 7 / 3
运行计算并返回数字 - 使用 Python，因此请确保在必要时使用浮点语法

2. 平均狗体重：
例如平均狗体重：牧羊犬
在给定品种的情况下返回狗的平均体重

下面是acions的文档：
{action_doc}

你的输出应该是一个json格式的字符串，输出需要遵循的json scheme如下：{LLMOutput.model_json_schema()}
其中
- thinkint 是你的思考
- actions 是你的行动
- parameter 是你需要执行行动的参数
- observation 是你的观察
- answer 是你的答案


当你认为自己已经找到了答案时，不输出actions,同时输出answer。
输出时，**直接返回json字符串**，不需要任何额外的输出，你的输出将被直接解析为json字符串，所以请确保你的输出是一个合法的json字符串。
不要在输出中包含任何额外的信息，只需返回json字符串。你的输出将被使用LLMOutput.model_validate_json建立一个LLMOutput对象
每次输出之进行一步操作，不要在一个输出中包含多个操作。
"""
```

通过以上方式，ReAct 利用大模型的能力，结合 Python 的强大后端处理，实现了从非结构化文本到结构化数据的转换，提高了信息的可用性和操作的精确度。

我们定义一个`Agent` 类来实现大模型能干什么

```python
class Agent:
    def __init__(self, system="你好"):
        self.system = system
        self.messages = []
        if self.system:
            self.messages.append({"role": "system", "content": system})

    def __call__(self, message):
        self.messages.append({"role": "user", "content": message})
        result = self.execute()
        self.messages.append({"role": "assistant", "content": result})
        return result

    def execute(self):
        completion = client.chat.completions.create(
            model="deepseek-chat", messages=self.messages
        )
        return completion.choices[0].message.content
```

ReAct 部分我们单独放在一个 query 函数里面

```python
def query(question, max_turns=5):
    i = 0
    bot = Agent(system_prompt)
    next_prompt = react_prompt + question
    while i < max_turns:
        i += 1
        result = extract_json(bot(next_prompt))
        print("*" * 80)
        print("Output: ", result)
        llm_output = LLMOutput.model_validate_json(result)
        if llm_output.actions:
            print("Actions:", llm_output.actions)
            # There is an action to run

            if llm_output.actions not in Actions.__members__.keys():
                raise Exception(
                    "Unknown action: {}: {}".format(
                        llm_output.actions, llm_output.parameter
                    )
                )
            print(" -- running {} {}".format(llm_output.actions, llm_output.parameter))
            observation = eval(Actions[llm_output.actions])(**(llm_output.parameter))
            print("Observation:", observation)
            next_prompt = "Observation: {}".format(observation)
        else:
            return llm_output.answer
```

这个流程是什么意思呢？就是说我们会把大模型的输出转成一个 json,包含思考、行动、参数、观察、结果五个字段，每次大模型的输出里面如果还有 action,那说明还需要使用工具，就把行动和参数拿出来运行一下，结果就是新的观察，循环往复，知道不需要 action,这个时候就把结果拿出来返回

下面是一个实际的输出

```
Output:  {
  "thinkint": "我需要计算两只狗的总体重",
  "actions": "average_dog_weight",
  "parameter": {
    "name": "Border Collie"
  },
  "observation": "获取边境牧羊犬的平均体重",
  "answer": ""
}
Actions: Actions.average_dog_weight
 -- running Actions.average_dog_weight {'name': 'Border Collie'}
Observation: a Border Collies average weight is 37 lbs
********************************************************************************
Output:  {
  "thinkint": "我已经知道边境牧羊犬的平均体重是37磅，现在需要获取苏格兰梗犬的平均体重",
  "actions": "average_dog_weight",
  "parameter": {
    "name": "Scottish Terrier"
  },
  "observation": "获取苏格兰梗犬的平均体重",
  "answer": ""
}
Actions: Actions.average_dog_weight
 -- running Actions.average_dog_weight {'name': 'Scottish Terrier'}
Observation: Scottish Terriers average 20 lbs
********************************************************************************
Output:  {
  "thinkint": "我已经知道苏格兰梗犬的平均体重是20磅，现在可以计算两只狗的总体重",
  "actions": null,
  "parameter": null,
  "observation": "计算两只狗的总体重",
  "answer": "两只狗的总体重是57磅"
}
两只狗的总体重是57磅
```

可以看到正确的输出`两只狗的总体重是57磅`

### 结论

ReAct 不仅展示了大模型与现代编程语言如 Python 的结合潜力，还提供了一个框架，使得 AI 集成变得更加灵活和有力。这种方法极大地推动了开发者在实际应用中实现自动化和智能化，无疑将在未来的技术发展中扮演重要角色。
