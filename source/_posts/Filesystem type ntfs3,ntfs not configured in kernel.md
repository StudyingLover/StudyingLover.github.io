---
title: Filesystem type ntfs3,ntfs not configured in kernel
banner_img: https://cdn.studyinglover.com/pic/2023/07/6eb76e56ebdd72a1bbcb48f4a19cc0da.png
date: 2023-7-14 9:35:00
categories:
- 踩坑
---
# Filesystem type ntfs3,ntfs not configured in kernel
昨天卸载硬盘的时候卡住了，然后我就直接拔下了硬盘，再插上就出现了这个问题
![image.png](https://cdn.studyinglover.com/pic/2023/07/7da166adca81943084fbc25dae0a3e16.png)

我先用备份恢复了一下，但是重新插上硬盘问题依然存在。接下来google了一下，Archwiki中有提到[这个问题](https://wiki.archlinux.org/title/NTFS)，但是标记这个问题是已经过时的，所描述的问题已得到解决。从内核版本6.2开始，ntfs3支持`windows_names`选项。我就先按照文档说的做了，但是问题依然没有解决。
![image.png](https://cdn.studyinglover.com/pic/2023/07/92f0be4c455602d2eda6b9ecd6229969.png)

接下来翻了下reddit，发现有人存在类似的问题 https://www.reddit.com/r/archlinux/comments/s3w6uu/cannot_mount_ntfs_drives_on_516/ ， 有人提到需要安装`ntfs-3g` ,那么就是
```bash
yay ntfs-3g
```

问题解决