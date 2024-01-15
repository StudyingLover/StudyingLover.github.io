---
title: linux下NTFS磁盘报错输入输出错误
banner_img: https://cdn.studyinglover.com/pic/2023/12/334c0c129076533308cbc7e03f8c55be.png
date: 2024-1-15 22:50:00
tags:
- 踩坑
---

# linux下NTFS磁盘报错输入输出错误

简单来说就是我在linux下挂载了一个NTFS格式的移动硬盘，然后在使用的时候，今天我想删除一个文件夹，突然给了我一个报错

```bash
输入/输出错误
```

看到这个错误，我开了几个终端，又是`ntfsfix`修磁盘,又是`dmseg`看日志,一通操作猛如虎，问题依然没解决

这个时候我们注意到(attention is all you need)，ntfs是微软的闭源格式，linux下的ntfs-3g是一个开源的ntfs驱动，这个驱动是不是有问题呢？

关机，打开linux,扫描并修复磁盘，删除，问题解决。