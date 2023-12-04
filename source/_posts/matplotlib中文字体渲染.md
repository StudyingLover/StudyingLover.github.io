---
title: matplotlib中文字体渲染
banner_img: https://cdn.studyinglover.com/pic/2023/12/334c0c129076533308cbc7e03f8c55be.png
date: 2023-12-4 21:52:00
tags:
- 踩坑
---

# matplotlib中文字体渲染
matplotlib 在画图例的时候不可避免的需要使用中文字体，但是有的时候电脑自带的字体不能渲染中文，这就需要我们自己解决字体问题。

首先用一个代码看一下系统里的字体哪些可以正常渲染中文字体

```python
import matplotlib.font_manager as font_manager
import matplotlib.pyplot as plt
import time

def find_chinese_fonts(test_string):
    """
    This function tests each available font to see if it can render the given Chinese string
    without causing any rendering issues or noticeable delays.
    """
    fonts = font_manager.findSystemFonts(fontpaths=None, fontext='ttf')
    working_fonts = []

    for font in fonts:
        try:
            prop = font_manager.FontProperties(fname=font)
            plt.figure()
            start_time = time.time()
            plt.text(0.5, 0.5, test_string, fontproperties=prop, ha='center', va='center')
            plt.close()
            end_time = time.time()
            render_time = end_time - start_time

            # Check if the rendering time is less than a certain threshold (e.g., 0.5 seconds)
            if render_time < 5:
                working_fonts.append(font)

        except Exception as e:
            # If there's an error rendering with this font, skip it
            continue

    return working_fonts

# Test string: "不卡顿"
test_string = "不卡顿"
fonts = find_chinese_fonts(test_string)
fonts

```

假设输出了 `'/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf'` 

使用这个字体的代码就是
```python
from matplotlib.font_manager import FontProperties

# 创建一个FontProperties对象，指定字体文件路径
font = FontProperties(fname='/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf')

# 绘制散点图
plt.scatter([1,2,3], [4,5,6], color="red")

# 添加图例，使用指定的字体
plt.legend(["例子"], prop=font)

# 显示图像
plt.show()
```

假如代码没找到可用字体呢？

手动下载字体。以下是一些中文字体的官方下载页面或者信誉良好的资源：

1. **思源宋体（Source Han Serif）**:
	 - 官方GitHub页面: [Adobe Fonts](https://github.com/adobe-fonts/source-han-serif)
	 - 选择您需要的语言子集，例如简体中文（SC），并下载相应的 OTF 文件。
1. **思源黑体（Source Han Sans）**:
	- 官方GitHub页面: [Adobe Fonts](https://github.com/adobe-fonts/source-han-sans)
	- 同样地，选择您需要的语言子集，并下载 OTF 文件。
3. **文泉驿正黑（WenQuanYi Zen Hei）**:  
	- 官方网站: [WenQuanYi](http://wenq.org/wqy2/index.cgi?ZenHei)
	- 可以直接下载 TTF 文件。

下载完成后然后`font = FontProperties(fname='/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf')` 引入即可。