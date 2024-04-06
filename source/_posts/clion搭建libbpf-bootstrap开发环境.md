---
title: clion搭建libbpf-bootstrap开发环境
banner_img: https://cdn.studyinglover.com/pic/2023/07/b5c4ecf9aa476ca1073f99b22fe9605e.jpg
date: 2024-4-6 21:45:00
categories:
- 踩坑
tags:
- libbpf-bootstrap
- ebpf
- clion
- Clion
---

# clion搭建libbpf-bootstrap开发环境

首先用clion打开libbpf-bootstrap目录，将`example/c`下的`CMakeLists.txt`导入

这个时候你会发现代码不能用clion自带的可视化界面debug,这是因为libbpf-bootstrap目录结构太离谱了，我们只需要做一个小小的更改

将**73**行的
```CMakeLists.txt
set(LIBBPF_LIBRARIES ${CMAKE_CURRENT_BINARY_DIR}/libbpf/libbpf.a)
```

改成
```CMakeLists.txt
set(LIBBPF_LIBRARIES ${CMAKE_CURRENT_BINARY_DIR}/../../../libbpf/src/libbpf.a)
```

结束，享受clion的优秀