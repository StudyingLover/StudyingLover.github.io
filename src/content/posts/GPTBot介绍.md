---
title: GPTBot介绍
banner_img: https://cdn.studyinglover.com/pic/2023/08/e7c591ac6e7423c1c9576ca0716c4d01.jpg
date: 2023-8-11 20:58:00
---
# GPTBot介绍
最近，openai公布了[GPTBot](https://platform.openai.com/docs/gptbot/gptbot) 的相关信息，并给出了禁止GPTBot的方法。以下是全文翻译。

GPTBot是OpenAI的网络爬虫，可以通过以下User agent和字符串来识别。
```
User agent token: GPTBot
Full user-agent string: Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)
```

## 使用
使用 GPTBot 用户代理爬取的网页可能会用于改进未来的模型，并且会过滤掉需要付费访问、已知收集个人身份信息（PII）或含有违反我们政策的文本的来源。允许 GPTBot 访问您的网站可以帮助 AI 模型变得更准确，提高它们的一般能力和安全性。在下面，我们还分享了如何禁止 GPTBot 访问您的网站。

### 禁止 GPTBot
要禁止 GPTBot 访问您的网站，您可以将 GPTBot 添加到您网站的 robots.txt：
```
User-agent: GPTBot
Disallow: /
```


### 自定义 GPTBot 访问
要允许 GPTBot 仅访问您网站的部分内容，您可以将 GPTBot 令牌添加到您网站的 robots.txt，如下所示：
```
User-agent: GPTBot
Allow: /directory-1/
Disallow: /directory-2/
```


### IP 出口范围
对于 OpenAI 的爬虫，它会从 [OpenAI 网站](https://openai.com/gptbot-ranges.txt)上记录的 IP 地址段向网站发出请求。

这里我给出IP 地址段
```
20.15.240.64/28
20.15.240.80/28
20.15.240.96/28
20.15.240.176/28
20.15.241.0/28
20.15.242.128/28
20.15.242.144/28
20.15.242.192/28
40.83.2.64/28
```