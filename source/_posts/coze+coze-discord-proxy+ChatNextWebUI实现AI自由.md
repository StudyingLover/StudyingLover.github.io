---
title: coze+coze-discord-proxy+ChatNextWebUI实现AI自由
excerpt: 探索使用Pydantic、OpenAI和JSON控制大模型输出的最佳实践，实现可控、可解析的AI输出，适用于多种下游任务。
banner_img: https://cdn.studyinglover.com/pic/2023/07/b5c4ecf9aa476ca1073f99b22fe9605e.jpg
date: 2024-3-31 19:12:00
categories:
  - 踩坑
tags:
  - 免费gpt
  - coze
  - coze-discord-proxy
  - ChatNextWebUI
  - AI
---

# coze+coze-discord-proxy+ChatNextWebUI 实现 AI 自由

前不久我的 openai 账号被封了，还亏了这个月的 20 刀 gpt4 月费，可谓是亏麻了。为了继续使用 gpt4,我们需要注册一个账号，找到一个接口或者去折腾 gpt4free,但是有没有更加轻松的方式呢？

诶，实际上真的有，那就是字节的 [扣子(coze)](coze.com),可以自己构建知识库，加入插件，工作流，还有很多功能，更重要的是，我们可以白嫖 gpt4 128k 上下文版本！就决定是他了，开始白嫖

## 注册 coze 并构建机器人

首先开**全局代理**然后访问 [海外版扣子](coze.com),

可以参考知乎的这个回答，给自己构建一个完整的 gpt 助手.[# Coze 揭秘：零基础如何打造专属 AI，完全免费！](https://zhuanlan.zhihu.com/p/682435326?utm_campaign=shareopn&utm_medium=social&utm_psn=1755880631257821184&utm_source=wechat_session)

## 搭建 coze-discord-proxy

官方[repo](https://github.com/deanxv/coze-discord-proxy) . 也可以参考这个教程进行部署[通过接口调用 Coze 托管的 discord-bot，实现免费使用 GPT4 和绘画](https://www.dqzboy.com/16532.html)

这里我解释一下这个项目是怎么工作的

如图所示，我们知道 discord 是允许机器人对话的，那我们构建两个机器人 COZE-BOT 和 CDP-BOT。COZE-BOT 和 coze 服务器对话，CDP-BOT 和 api 接口对话，将信息转发，就实现了一个 gpt 的接口。

![image.png](https://cdn.studyinglover.com/pic/2024/03/867127c0de08acc84d6f70bcae8a04f7.png)

## 宝塔搭建反向代理+cloudflare 代理

我们首先将域名托管到 cloudflare, 添加一个解析到我们的服务器，然后选择左侧的 Origin Server, 给刚才解析的域名添加一个 15 年的证书，然后保存。
![image.png](https://cdn.studyinglover.com/pic/2024/03/f3717de1caed3352219a4f07c0b5369f.png)

假设我们 coze-discord-proxy 的端口是 2077,打开宝塔面板，添加一个网站，设置反向代理到 localhost:7077,然后打开 ssl,填入刚才获取的 cloudflare15 年证书，成功后应该能看到这个
![image.png](https://cdn.studyinglover.com/pic/2024/03/7051490e8c5e49cdb507e9e6d8b401ea.png)

我们访问 `https://域名/swagger/index.html` 应该就能看到 swagger 文档了。

## ChatNextWebUI 集成

我们可以将这个接口当作正常的 openai 接口用，base url 就是我们的域名，api key 是在前面部署 coze-discord-proxy 的时候指定的 PROXY_SECRET 参数
