---
title: jsdelivr加速Github文件
banner_img: https://cdn.jsdelivr.net/gh//StudyingLover/anything/f057ee81b5a9141d222fe12f55b7dfc.jpg
date: 2023-1-20 10:00:00
categories:
- 工具

---
假设GitHub路径为`https://github.com/username/repo-name/path/to/file` ,用jsdelivr可以加速或者在html中引用，路径为`https://cdn.jsdelivr.net/gh/username/repo-name/path/to/file` 

这里实现了一个简单的链接转换函数，可以将GitHub路径转换为jsdelivr路径
```python
def find_first_occurrence(string, substring):
    return string.find(substring)
def gh_path2jsdelivr(path):
    if(find_first_occurrence(path,"/blob/") != -1):
        path = path.replace("/blob/", "/")
    if(find_first_occurrence(path,"/main/") != -1):
        path = path.replace("/main/", "/")
    if(find_first_occurrence(path,"/master/") != -1):
        path = path.replace("/master/", "/")
    return path.replace("github.com", "cdn.jsdelivr.net/gh", 1)

print(gh_path2jsdelivr(""))

```
