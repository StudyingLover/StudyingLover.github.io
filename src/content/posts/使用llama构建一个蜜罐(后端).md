---
title: 使用llama构建一个蜜罐(后端)
banner_img: https://cdn.studyinglover.com/pic/2023/07/869e354fa5d2254251c10bc2e3cf1bef.png
date: 2023-7-29 17:52:00
tags:
- 网络安全
---
# 使用llama构建一个蜜罐(后端)
![](https://cdn.studyinglover.com/pic/2023/07/e9a49d4a404ed9bc4b0f119249194e3d.png)

完整项目开源在了[GitHub](https://github.com/StudyingLover/llama-honeypot-python)

众所周知，蜜罐是一个很有趣的东西，他是一种网络安全机制，旨在诱使攻击者攻击虚假的系统或应用程序，以便安全专业人员可以监视攻击者的行为并收集攻击者的信息。蜜罐通常是一台虚拟机或一台计算机，它看起来像一个真实的系统，但实际上是一个特意构建的系统，用于诱骗攻击者。攻击者在攻击蜜罐时，安全专业人员可以收集攻击者的信息，例如攻击者使用的工具、攻击者的IP地址、攻击者的攻击技术等等。这些信息可以帮助安全专业人员更好地了解攻击者的行为和意图，并采取相应的措施来保护真实的系统。

但是缺点很明显，不管我怎么做蜜罐终究是跑在真实的服务器上的，还是很可能被攻破，所以，我们能不能让ai模仿一个linux主机作为蜜罐？

今天早上看到了这个视频 https://b23.tv/pXiGNIK ， 他开源了一个使用chatGPT作为终端的代码，开源在[gitee](gitee.com/cutecuteyu/chatgpt-honeypot) ，不幸的是我openai账户没钱了，但是，昨天我才写了[搭建与openai接口兼容的服务器接口](https://studyinglover.com/2023/07/28/llama-cpp-python%E5%BF%AB%E9%80%9F%E4%B8%8A%E6%89%8B/#%E6%90%AD%E5%BB%BA%E4%B8%8Eopenai%E6%8E%A5%E5%8F%A3%E5%85%BC%E5%AE%B9%E7%9A%84%E6%9C%8D%E5%8A%A1%E5%99%A8%E6%8E%A5%E5%8F%A3), 那么我就可以改造一下他的代码，使用llama作为后端

首先clone他的仓库
```bash
git clone gitee.com/cutecuteyu/chatgpt-honeypot
cd ./chatgpt-honeypot
```

同时安装依赖
```bash
pip install openai
```

接下来我们在`chatgpt-honeypot`目录下创建一个 `.env` 文件，写上接口路径
```.env
export OPENAI_API_BASE = http://localhost:8000/v1
```

然后修改`myopenaiapikey.py` 文件，在第二行的`api=""` 中双引号随便填入一点东西。

下面修改`honeypot.py` ，因为我们的后端换成了llama,那么我们的prompt也需要更改,这里借鉴了[这个项目](https://github.com/Coldwave96/llama-honeypot) ,将`chat2` 函数改成下面的内容
```python
def chat2(query):
	response = openai.ChatCompletion.create(
		model="gpt-3.5-turbo-0613",
		messages=[
		{"role": "assistant",
		"content": """
		I want you to act as a Linux terminal. I will provide commands and history, then you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. Do no write explanations. Do not type commands unless I instruct you to do so.\n\n### Command:\n{command}\n\n### History:\n{history}\n### Response:\n
		"""},
		{"role": "user", "content": query}],
	)
	message = response["choices"][0]["message"]
	return message
```

启动项目，正常IDE运行或者在命令行
```bash
python3  honeypot.py
```

启动llama后端,将/path/to改成你的路径
```bash
python3 -m llama_cpp.server --model  /path/to/llama-2-13b-chat.ggmlv3.q4_1.bin
```

在浏览器访问`http://127.0.0.1:9000/admin/ls`,看到浏览器显示`/home/user/Documents/project` 类似的内容说明运行成功。

项目当然还有很多可以改进的地方，例如使用更好的prompt,或者微调llama作为后端，留给大家继续探索。