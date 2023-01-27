---
title: jsdelivr加速Github文件
banner_img: https://raw.githubusercontent.com/StudyingLover/anything/main/background.png
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
