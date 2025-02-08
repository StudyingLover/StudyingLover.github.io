---
title: zhipuAI接口兼容openai
banner_img: https://cdn.studyinglover.com/pic/2023/10/faf4c4a867b04fc7cc77110926bf2d43.png
date: 2024-4-10 18:04:00
categories:
- 踩坑
tags:
- zhipu
- openai
- 质谱AI
- 大模型
---

# zhipuAI接口兼容openai

最近debug发现质谱AI的接口是兼容openai这个库的

首先访问 [官网](https://open.bigmodel.cn/) ,获取一个key

然后使用下面的代码生成jwt token, apikey天获取的key, exp_seconds是过期时间
```python
def generate_token(apikey: str, exp_seconds: int):
    try:
        id, secret = apikey.split(".")
    except Exception as e:
        raise Exception("invalid apikey", e)

    payload = {
        "api_key": id,
        "exp": int(round(time.time() * 1000)) + exp_seconds * 1000,
        "timestamp": int(round(time.time() * 1000)),
    }

    return jwt.encode(
        payload,
        secret,
        algorithm="HS256",
        headers={"alg": "HS256", "sign_type": "SIGN"},
    )
```

生成之后就可以按照下面的形式创建一个openai客户端
```python
from openai import OpenAI

client = OpenAI(base_url="https://open.bigmodel.cn/api/paas/v4", api_key=刚才生成的jwt token)
```
