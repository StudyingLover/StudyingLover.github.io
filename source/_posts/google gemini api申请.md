---
title: google gemini api申请
banner_img: https://cdn.studyinglover.com/pic/2023/12/334c0c129076533308cbc7e03f8c55be.png
date: 2023-12-14 22:40:00
tags:
- 踩坑
---
# google gemini api申请
首先登陆 https://ai.google.dev/pricing 
![image.png](https://cdn.studyinglover.com/pic/2023/12/af1a86c0c368f9368f6d125902d3b610.png)


往下滑，看一看到免费选项，每分钟60词请求对于个人完全够用，点击进入
![image.png](https://cdn.studyinglover.com/pic/2023/12/bb87b408e483fe0fa5999a2aacff299a.png)

进入后，先点击`Get API key`,然后点击`Create API kay in new project` 
![image.png](https://cdn.studyinglover.com/pic/2023/12/0c224ceeb462739a69a26f9c98b9b76b.png)

接下来可以看到类似的页面
![image.png](https://cdn.studyinglover.com/pic/2023/12/262c805af52491f846e38a9d1a2ff533.png)

复制你的key

在命令行通过下面的方式检查是否正常
```bash
curl \ -H 'Content-Type: application/json' \ -d '{ "prompt": { "text": "Write a story about a magic backpack"} }' \ "https://generativelanguage.googleapis.com/v1beta3/models/text-bison-001:generateText?key=YOUR_API_KEY"
```

可以看到
![image.png](https://cdn.studyinglover.com/pic/2023/12/001f17bea345dd0fee9edadbca84c6ed.png)
