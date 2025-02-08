---
title: fastapi 和 uvicorn 设置监听 ipv6
banner_img: https://cdn.studyinglover.com/pic/2024/07/21ee5e333aa0d9634b636e5ca06009e4.webp
index_img: https://cdn.studyinglover.com/pic/2024/07/21ee5e333aa0d9634b636e5ca06009e4.webp
date: 2024-7-14 23:00:00
tags:
  - fastapi
  - uvicorn
  - ipv6
  - 后端
  - fastapi ipv6
  - uvicorn ipv6
---

# fastapi 和 uvicorn 设置监听 ipv6

启动程序时我们一般写的是

```python
uvicorn.run(app, host="0.0.0.0", port=8000)
```

但是这样子启动的程序在纯 ipv6 或者双栈(同时有 ipv4 和 ipv6)的机子上使用 ip(v6):port 访问是访问不到的，所以我们需要更改启动方式。

直接参考[GitHub](https://github.com/encode/uvicorn/discussions/1529#discussioncomment-3061823)的一个讨论，最佳答案是[这个](https://github.com/encode/uvicorn/discussions/1529#discussioncomment-3061823)

想要监听 ipv6 就写成

```python
uvicorn.run(app, host="::", port=8000)
```

监听双栈写成

```python
uvicorn.run(app, host=None, port=8000)
```
