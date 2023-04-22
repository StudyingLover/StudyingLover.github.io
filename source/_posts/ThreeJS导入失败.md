---
title: ThreeJS导入失败
banner_img: https://proxy.thisis.plus/aadc0c1c0eb1c7f5e57ab3b42256cb0.jpg
date: 2023-1-13 10:00:00
categories:
- 踩坑
tags:
- ThreeJS
---
## 问题描述
```
-index.html 
-src.js
-node_modules
 -three
  -...
```

在`src.js` 中用如下方式导入ThreeJS
```
import * as THREE from 'three';
```
`index.html` body如下
```
<body>
    <script type="module" src="/src/day01_a.js"></script>
</body>
```
出现报错
```
Uncaught TypeError: Failed to resolve module specifier "three". Relative references must start with either "/", "./", or "../".
```
![image.png](https://proxy.thisis.plus/20230103172514.png)
## 解决方案
stackoverflow给出了解决方案https://stackoverflow.com/questions/65697410/not-using-node-js-uncaught-typeerror-failed-to-resolve-module-specifier-thre

![image.png](https://proxy.thisis.plus/20230103172625.png)

删除`src.js`的导入，将`index.html` body改为
```
<body>
    <script src="/node_modules/three/build/three.js"></script>
    <script type="module" src="/src/day01_a.js"></script>
</body>
```
