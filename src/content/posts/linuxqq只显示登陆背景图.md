---
title: linuxqq只显示登陆背景图
banner_img: https://cdn.studyinglover.com/pic/2023/12/334c0c129076533308cbc7e03f8c55be.png
date: 2024-12-18 18:20:00
tags:
  - 踩坑
---

首先

```bash
cd ~/.config/QQ/versions/
```

然后`ls`查看版本号，进入对应版本号的文件夹，删除 `libssh2.so.1` 文件，重启 linuxqq
