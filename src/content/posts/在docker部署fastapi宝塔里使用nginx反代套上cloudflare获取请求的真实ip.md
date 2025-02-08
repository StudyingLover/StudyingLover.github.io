---
title: 在docker部署fastapi宝塔里使用nginx反代套上cloudflare获取请求的真实ip
banner_img: https://cdn.studyinglover.com/pic/2023/07/b5c4ecf9aa476ca1073f99b22fe9605e.jpg
date: 2024-4-9 18:09:00
categories:
- 踩坑
tags:
- docker
- fastapi
- nginx
- cloudflare
- 宝塔
- 真实ip
- fastapi 反向代理
- 反向代理
- docker 172.17.0.1
---
# 在docker部署fastapi宝塔里使用nginx反代套上cloudflare获取请求的真实ip

背景是这样的，我使用docker部署了一个fastapi部署了一个应用，使用`request.client.host`获取请求的来源ip,但是获取到的都是`172.17.0.1`这显然是不是正常的，是docker网络下的ip,所以我们需要在nginx进行设置转发真实ip

首先点击宝塔**应用商店**，找到nginx，点击右边的**设置**，在**配置修改**中，找到`http`模块中的`include luawaf.conf;`，在下面添加如下两段代码，重载nginx
```conf
set_real_ip_from 0.0.0.0/0;
real_ip_header X-Forwarded-For;
```

同时在`/www/server/panel/vhost/nginx/proxy/你的网站` 这里路径下面能找到一个配置文件，在`location /`加上
```conf
location / {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://your_fastapi_app;
}
```

在fastapi中，我们将获取ip的代码改成下面这样
```python
ip_address = request.headers.get("X-Real-IP") if request.headers.get("X-Real-IP") else (request.headers.get("X-Forwarded-For") if request.headers.get("X-Forwarded-For") else request.client.host)
```
