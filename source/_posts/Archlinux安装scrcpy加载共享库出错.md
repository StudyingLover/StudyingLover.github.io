---
title: Archlinux安装scrcpy加载共享库出错 error while loading shared libraries:libusb-1.0.so.0:wrong ELF class:ELFCLASS32
banner_img: https://cdn.studyinglover.com/pic/2023/07/ab2b83b00e35b75a8efc48b98125ee5c.jpeg
date: 2023-7-21 16:13:00
categories:
- 踩坑
tag:
- ArchLinux
---
# Archlinux安装scrcpy加载共享库出错
在安装scrcpy时通过`sudo pacman -S scrcpy`顺利安装,但是运行报错
```
scrcpy: error while loading shared libraries: libusb-1.0.so.0: wrong ELF class: ELFCLASS32
```

这是在64位系统上运行32位库出错，我发现了这个10年的issue https://github.com/Rouji/Ergodone-Setup/issues/1 也就是说我们只需要运行`sudo pacman -S libusb-compat` 

但是运行之后出现了新的问题
```
libusb-compat: 文件系统中已存在 /usr/lib/libusb-0.1.so.4 
libusb-compat: 文件系统中已存在 /usr/lib/libusb-0.1.so.4.4.4 
libusb-compat: 文件系统中已存在 /usr/lib/libusb-0.1.so.4.4.4 
```

一般来说已经有的库就不要动它了，运行`sudo pacman -Syu` 没有解决，会报同样的错误，说明libusb这个文件不是包管理器提供的，那就删掉现有的库然后让pacman帮我们安装

```
sudo rm -f /usr/lib/libusb-0.1.so.4 
sudo rm -f /usr/lib/libusb-0.1.so.4.4.4 
sudo rm -f /usr/lib/libusb-0.1.so.4.4.4 
sudo pacman -S libusb-compat
```

插上手机，运行`scrcpy`,成功运行