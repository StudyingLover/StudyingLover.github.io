---
title: google gemini api使用
banner_img: https://cdn.studyinglover.com/pic/2023/12/334c0c129076533308cbc7e03f8c55be.png
date: 2023-12-14 23:15:00
tags:
- google gemini
---

# google gemini api使用
google最近发布了gemini api，我之前在[我的博客](https://studyinglover.com/2023/12/14/google%20gemini%20api%E7%94%B3%E8%AF%B7/) 介绍了如何申请，这篇文章来介绍如何使用

首先下载google的库
```bash
pip install -q -U google-generativeai
```

引入必要的包
```python
import pathlib
import textwrap

import google.generativeai as genai

from IPython.display import display
from IPython.display import Markdown


def to_markdown(text):
  text = text.replace('•', '  *')
  return Markdown(textwrap.indent(text, '> ', predicate=lambda _: True))
```

先将api添加到环境变量
```bash
export GOOGLE_API_KEY=你的密钥
```

接下来获取密钥
```python
GOOGLE_API_KEY=os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=GOOGLE_API_KEY)
```

可以通过下面命令获取所有模型
```python
for m in genai.list_models():
  if 'generateContent' in m.supported_generation_methods:
    print(m.name)
```


## 文本输入
接下来创建一个模型，并输入一个prompt,获取输出并转换成markdown格式
```python
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content("What is the meaning of life?")
to_markdown(response.text)
```
如果你的prompt比较奇奇怪怪，那么可能会不能正常获取到返回，你可以查看`response.prompt_feedback`获取原因。

还有一个有趣的事情，gemini可能会生成多个输出(candidates)，通过`response.candidates`获取。

流式传输也是可以的
```python
response = model.generate_content("What is the meaning of life?", stream=True)
for chunk in response:
  print(chunk.text)
  print("_"*80)
```

## 图片输入
下载官方的示例图片
```
curl -o image.jpg https://t0.gstatic.com/licensed-image?q=tbn:ANd9GcQ_Kevbk21QBRy-PgB4kQpS79brbmmEG7m3VOTShAn4PecDU5H5UxrJxE3Dw1JiaG17V88QIol19-3TM2wCHw
```
通过下面的代码可以查看图片
```python
import PIL.Image

img = PIL.Image.open('image.jpg')
img
```
![image.png](https://cdn.studyinglover.com/pic/2023/12/1042f6e0b6fa63d40f96fcd18fcf4be8.png)

接下来创建模型,并获取输出
```python
model = genai.GenerativeModel('gemini-pro-vision')
response = model.generate_content(img)

to_markdown(response.text)
```

也可以同时提供文本和图像
```python
response = model.generate_content(["Write a short, engaging blog post based on this picture. It should include a description of the meal in the photo and talk about my journey meal prepping.", img], stream=True)
response.resolve()
to_markdown(response.text)
```

## 聊天
初始化聊天：

```python
model = genai.GenerativeModel('gemini-pro')
chat = model.start_chat(history=[])
chat
```

开始聊天
```python
response = chat.send_message("In one sentence, explain how a computer works to a young child.")
to_markdown(response.text)
```

> **你一定想在这里使用图片聊天，请注意，`gemini-pro-vision`未针对多轮聊天进行优化**

可以通过`chat.history` 获取聊天历史
```python
for message in chat.history:
  display(to_markdown(f'**{message.role}**: {message.parts[0].text}'))
```

流式传输也可以使用
```python
response = chat.send_message("Okay, how about a more detailed explanation to a high schooler?", stream=True)

for chunk in response:
  print(chunk.text)
  print("_"*80)
```

## 嵌入
使用起来没啥可说的
```python
result = genai.embed_content(
    model="models/embedding-001",
    content="What is the meaning of life?",
    task_type="retrieval_document",
    title="Embedding of single string")

# 1 input > 1 vector output
print(str(result['embedding'])[:50], '... TRIMMED]')
```

当然，批量处理也可以
```python
result = genai.embed_content(
    model="models/embedding-001",
    content=[
      'What is the meaning of life?',
      'How much wood would a woodchuck chuck?',
      'How does the brain work?'],
    task_type="retrieval_document",
    title="Embedding of list of strings")

# A list of inputs > A list of vectors output
for v in result['embedding']:
  print(str(v)[:50], '... TRIMMED ...')
```

你甚至可以传递一个`chat.history`
```python
result = genai.embed_content(
    model = 'models/embedding-001',
    content = chat.history)

# 1 input > 1 vector output
for i,v in enumerate(result['embedding']):
  print(str(v)[:50], '... TRIMMED...')
```