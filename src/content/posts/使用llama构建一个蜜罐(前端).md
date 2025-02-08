---
title: 使用llama构建一个蜜罐(前端)
banner_img: https://cdn.studyinglover.com/pic/2023/07/e9a49d4a404ed9bc4b0f119249194e3d.png
date: 2023-8-1 00:12:00
tags:
- 网络安全
---
# 使用llama构建一个蜜罐(前端)
![](https://cdn.studyinglover.com/pic/2023/07/e9a49d4a404ed9bc4b0f119249194e3d.png)
在[使用llama构建一个蜜罐(后端)](https://studyinglover.com/2023/07/29/%E4%BD%BF%E7%94%A8llama%E6%9E%84%E5%BB%BA%E4%B8%80%E4%B8%AA%E8%9C%9C%E7%BD%90(%E5%90%8E%E7%AB%AF)/) 中我们通过llama和flask构建了一个蜜罐的后端，通过将shell命令作为字段的一部分，让llama假装执行命令来防止蜜罐被攻破。那有了后端我们还需要一个前端命令行来让用户登陆并执行命令。

完整项目开源在了[GitHub](https://github.com/StudyingLover/llama-honeypot-python)

接下来，让我们来实现一个模拟ssh服务器，或者说实现一个ssh mock 然后执行命令的时候不让他真的执行同时改一下输出。

**等等？我们真的需要一个ssh mock 吗？** 还是说，我们需要的是一个**跑在终端的，长得很像终端的，能输入输出的，一个可交互的代码？** 

哦，好像我们需要的只是一个可交互的代码，难道攻击方ssh上来了还能验证一下这是不是真的是终端？(我用了三天才想通这个问题)

so,工作量一下子减少了太多了
```python
import os
import requests
  
# 禁用 Ctrl Z stty susp undef
# 启用 Ctrl Z stty susp ^Z

admin_key = "123456"

def get_responce(command):
	if (command == admin_key):
		exit()
	output = requests.post("http://127.0.0.1:9000/admin/"+command).json()
	return output["message"]
    
def attact_warning():
	pass
  
def anti_attact():
	pass
  
while True:
	attact_warning()
	anti_attact()
	try:
		command = input("[root@ubuntu ~]$ ")
		print(get_responce(command))
	  
	except KeyboardInterrupt:
		print("")
```

这里有几个点需要注意
1. 代码**不能直接用于生产环境！！！请先完善细节并大量测试。本项目仅为学习使用，未经过专业人员测试**
1. `admin_key`，这个变量的作用是让管理员能用终端，**记得修改**。如果你认为这种方法太low了或者可能被作为突破口，请修改或PR。
2. 接口地址，我这里是`http://127.0.0.1:9000/admin/` ，这里需要改成你的，建议先用postman或者apifox或者啥的测一下。
3. 入侵检测和反击模块需要你**自己实现**，毕竟这只是一个让你的蜜罐更安全的项目。

在三个终端分别运行llama服务器(图右终端)，蜜罐后端(图左终端)和蜜罐前端(图中终端)

![image.png](https://cdn.studyinglover.com/pic/2023/07/dd31f63365b8a8657b1459f7fe883a36.png)

项目还有很多改进之处，在后面我也会进一步优化prompt和模型来获得更好的终端对话体验。