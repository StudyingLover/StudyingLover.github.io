---
title: 手机平板远程访问kvm虚拟机的windows
banner_img: https://cdn.studyinglover.com/pic/2023/12/5c4ffb4ee8500a9cdfa2406137e5e0a8.jpg
date: 2023-12-23 19:28:00
tags:
- 踩坑
---


# 手机平板远程访问kvm虚拟机的windows
最近快期末周了，开始陆陆续续开始复习(预习)这学期的课，于是有了一个需求，我希望在床上用手机可以看我linux电脑上kvm虚拟机里面的网课。

首先使用`superRDP2`给kvm虚拟机里面的windows装上了rdp，并且在linux上测试了一下确保rdp是通的。接下来只需要解决手机和windows网络连通性的问题，我ping了一下，果然不通。

现在的虚拟机是在虚拟网络下面，能ping通才见鬼了。我们可以把虚拟机改成桥接模型，不出意外的话就能解决这个问题了

接着我收获了一个报错
```
操作失败: 桥接 win11 不存在

Traceback (most recent call last):
  File "/usr/share/virt-manager/virtManager/addhardware.py", line 359, in change_config_helper
    define_func(devobj=devobj, do_hotplug=True, **define_args)
  File "/usr/share/virt-manager/virtManager/object/domain.py", line 862, in define_network
    self._process_device_define(editdev, xmlobj, do_hotplug)
  File "/usr/share/virt-manager/virtManager/object/domain.py", line 532, in _process_device_define
    self.hotplug(device=editdev)
  File "/usr/share/virt-manager/virtManager/object/domain.py", line 1124, in hotplug
    self._update_device(device)
  File "/usr/share/virt-manager/virtManager/object/domain.py", line 1085, in _update_device
    self._backend.updateDeviceFlags(xml, flags)
  File "/usr/lib/python3.11/site-packages/libvirt.py", line 3293, in updateDeviceFlags
    raise libvirtError('virDomainUpdateDeviceFlags() failed')
libvirt.libvirtError: 操作失败: 桥接 win11 不存在
```

笑死就没有win11这个网络让我桥接，我想改成桥接还得改配置，多是一件麻烦事。很自然的我们就想到了端口转发。

```bash
ssh -L [宿主机端口]:[虚拟机IP]:3389 [宿主机用户]@[宿主机IP]
```
将`宿主机端口`，`虚拟机IP`，`宿主机用户`，`宿主机IP`，换成你的，运行，就像正常的ssh一样，就实现了端口转发，只是原本windows的ip写成宿主机的，端口写成宿主机端口。

有的同学会发现这个方法不work,是我们的配置出错了吗？是的，我们忘了一件事情：当使用SSH端口转发时，默认情况下，转发的端口可能仅绑定到localhost。所以我们需要修改命令

```bash
ssh -L 0.0.0.0:[宿主机端口]:[虚拟机IP]:3389 [宿主机用户]@[宿主机IP]
```

work 了
