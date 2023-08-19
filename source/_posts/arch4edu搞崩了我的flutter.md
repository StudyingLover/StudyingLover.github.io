---
title: arch4edu搞崩了我的flutter
banner_img: https://cdn.studyinglover.com/pic/2023/08/588d9420c9302f5e0d6c2e89fbddf200.png
date: 2023-8-19 21:36:00
---
# arch4edu搞崩了我的flutter
今天是快乐的一天，适合滚包
```
yay
```
一切安好，arch4edu说我的flutter需要更新
```bash
==> 要排除的包: (示例: "1 2 3", "1-3", "^4" 或软件库名称)
 -> 排除软件包可能会导致不完整的升级并破坏系统
==> 

```
没什么需要排除的，接下来就是愉快的自动安装

突然我看到了这个

![image.png](https://cdn.studyinglover.com/pic/2023/08/d257220b6c5bc01465f92fdd72320344.png)


警告啦，没啥好担心的啦，待会跑一下看好着没

```bash
flutter doctor                     
Found an existing Pub cache at /home/zjh/.pub-cache.
It can be repaired by running `dart pub cache repair`.
It can be reset by running `dart pub cache clean`.
Found an existing Dart Analysis Server cache at /home/zjh/.dartServer.
It can be reset by deleting /home/zjh/.dartServer.
Flutter failed to write to a file at "/opt/flutter/packages/flutter_tools/.dart_tool/version".
Please ensure that the SDK and/or project is installed in a location that has read/write
permissions for the current user.
Try running:
  sudo chown -R $(whoami) /opt/flutter/packages/flutter_tools/.dart_tool/version

```

好的他炸了

看着问题不大，就是读写权限的问题，的问题？鬼知道会有啥问题，我决定让arch4edu滚蛋

先`sudo pacman -Rns flutter`把arch4edu的flutter删掉，然后去`/etc/pacman.conf` 删除了arch4edu镜像，再`sudo pacman -Syu`滚一遍包，最后`yay flutter`

中间会有一个问题
```
错误：无法提交处理 (有冲突的文件)
flutter: 文件系统中已存在 /opt/flutter/bin/cache/flutter_version_check.stamp 
发生错误，没有软件包被更新。
```
ok,sudo直接删就行，反正是cache

最后`flutter docker`

```bash
Doctor summary (to see all details, run flutter doctor -v):
[✓] Flutter (Channel stable, 3.13.0, on Arch Linux 6.4.10-arch1-1, locale zh_CN.UTF-8)
[✓] Android toolchain - develop for Android devices (Android SDK version 34.0.0)
[✓] Chrome - develop for the web
[✓] Linux toolchain - develop for Linux desktop
[✓] Android Studio (version 2022.2)
[✓] Connected device (2 available)
[✓] Network resources

• No issues found!

```