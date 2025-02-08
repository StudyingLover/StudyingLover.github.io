---
title: arch蓝牙无法连接
banner_img: https://cdn.studyinglover.com/pic/2023/08/a5e39db5abf0853e6c456728df8bd971.jpg
date: 2023-8-10 17:18:00
tags:
- 踩坑
---

# arch蓝牙无法连接
在arcchlinux成功安装并且已经安装蓝牙的相关包之后，在设置打开蓝牙发现需要先开启蓝牙。

没啥好的解决办法，运行
```bash
systemctl enable  --now bluetooth 
```
问题解决。