---
title: 深入分析：GitHub Trending 项目 "multipleWindow3dScene"
banner_img: https://cdn.studyinglover.com/pic/2023/11/b57a22bd9cf8a1c0a954fd61e6c311f2.png
date: 2023-11-27 19:18:00
tags:
- threejs
- 前端
---

这是由chatGPT生成的文章，内容是关于GitHub Trending 项目 "multipleWindow3dScene"的深入分析，分享链接[ChatGPT](https://chat.openai.com/share/289860f7-6e7e-458c-b3a8-fe97d01e63bd)

其实作者用的技术并不是很新的东西，treejs已经被使用很多年了，跨窗口同步状态也有很多讲解，但是作者把这两个东西结合起来，做出了一个很有意思的东西。

项目地址 [GitHub](https://github.com/bgstaal/multipleWindow3dScene)

# 深入分析：GitHub Trending 项目 "multipleWindow3dScene"

GitHub上备受瞩目的 "multipleWindow3dScene" 项目，是一个创新的尝试，通过 `three.js` 和 `localStorage` 在多个浏览器窗口之间同步3D场景。我们将详细探讨其技术实现。

## `main.js` 文件解析

### 初始化与场景建立
1. **引入 `WindowManager`**: `main.js` 首先导入 `WindowManager.js`，用于跨窗口同步状态。
2. **场景和相机配置**:
   - 使用 `three.js` 创建了一个3D场景。
   - 初始化了一个正交摄像头，设置其位置，以便在3D场景中正确观察对象。
3. **渲染器配置**:
   - 采用 `three.js` 的 WebGL 渲染器渲染场景。
   - 渲染器的元素被添加到文档体中，用于显示3D内容。

### 动态调整和事件处理
1. **窗口尺寸调整**: 代码监听浏览器窗口的 `resize` 事件，以便动态调整3D场景的大小。

## `WindowManager.js` 文件解析

### 跨窗口状态管理
1. **存储窗口信息**: `#windows` 私有属性存储了所有打开窗口的信息（尺寸、位置和唯一标识符）。
2. **事件监听**:
   - `storage` 事件监听器用于在其他窗口更新 `localStorage` 时接收通知。
   - `beforeunload` 事件监听器在窗口关闭前，从 `localStorage` 中移除该窗口的信息。

### 状态同步
1. **初始化和状态更新**: 窗口创建时，窗口信息被初始化并保存在 `localStorage`。
2. **跨窗口通信**: 更新 `localStorage` 并监听 `storage` 事件，以实现窗口间状态的实时同步。

## 应用实例

### 多窗口3D场景交互
在一个窗口中对3D对象进行的操作会通过 `localStorage` 更新到其他所有窗口。其他窗口监听到 `storage` 事件后，更新其3D场景以反映出这些变化。

### 窗口状态同步
项目能够实时跟踪每个窗口的状态。当用户调整其中一个窗口的大小或位置时，这种变化会通过 `localStorage` 及时反映到其他窗口中。

## 结论
"multipleWindow3dScene" 展示了如何在不同浏览器窗口间同步复杂的3D场景。这种方法开辟了多窗口Web应用的新可能性，为创造连贯且互动的用户体验提供了强大工具。