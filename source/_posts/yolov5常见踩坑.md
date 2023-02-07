---
title: yolov5和yolov5-face常见踩坑
banner_img: https://cloud.studyinglover.com/api/raw/?path=/photos/blog/33a1d238f41bcd6994390b5a52067cd6.png
date: 2023-2-7 16:49:00
categories:
- 踩坑
tags:
- 机器视觉
---
# yolov5常见踩坑
##  not enough values to unpack (expected 2, got 0)
如图
![](https://cdn.jsdelivr.net/gh/StudyingLover/anything/93bbd4d663cd589dfdd522e0479bb46.png)

我们需要检查一下我们标记的txt文件
举个例子

这是我们需要的标记格式

```txt
0 0.5 0.5 0.5 0.5
```

这是错误的标注格式
```txt
0 0.5 0.5 0.5 0.5

```

问题就出在了最后一行的`\n`上，我们删除最后一行就可以了。我用chatGPT写了一个函数来做这件事
```python
# 去除txt文件中的空行
def remove_empty_lines(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()
    with open(file_path, 'w') as f:
        for line in lines:
            if len(line)>3:
                f.write(line)
```

## AssertionError: No results.txt files found in /content/yolov5-face/runs/train/exp, nothing to plot.

```
Traceback (most recent call last):
File "train.py", line 513, in
train(hyp, opt, device, tb_writer, wandb)
File "train.py", line 400, in train
plot_results(save_dir=save_dir) # save as results.png
File "/content/yolov5-face/utils/plots.py", line 393, in plot_results
assert len(files), 'No results.txt files found in %s, nothing to plot.' % os.path.abspath(save_dir)
AssertionError: No results.txt files found in /content/yolov5-face/runs/train/exp, nothing to plot.
```
出现这个问题的原因是此代码块未运行
```python
# Results
       if ckpt.get('training_results') is not None:
           with open(results_file, 'w') as file:
               file.write(ckpt['training_results'])  # write results.txt
```
如果你只使用单 GPU 并设置 epoch <20，这个块将不起作用。解决方案是设置epoch>20。