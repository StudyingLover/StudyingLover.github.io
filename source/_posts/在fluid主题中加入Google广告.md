---
title: 在fluid主题中加入Google广告
banner_img: https://raw.githubusercontent.com/StudyingLover/anything/main/background.png
categories:
- 工具
---
# 在fluid主题中加入Google广告

在fluid的[官方文档](https://hexo.fluid-dev.com/posts/fluid-adsense/)中，提供了在fluid主题中加入Google广告的方法，但是其中提到的参数`data-ad-slot`并没有说清怎么获取，所以我决定详细写一下如何获取。

## 注册Google Adsense
访问[Google Adsense](https://www.google.com/adsense/start/)，注册一个账号，然后点击右侧的广告。
![](https://raw.githubusercontent.com/StudyingLover/anything/main/20230127100353.png)

## 创建一个广告单元
选择上方的按广告单元
![](https://raw.githubusercontent.com/StudyingLover/anything/main/20230127100502.png)

这里我选择了推荐的展示广告
![](https://raw.githubusercontent.com/StudyingLover/anything/main/20230127100605.png)

接着自定义广告单元，自定义广告
![](https://raw.githubusercontent.com/StudyingLover/anything/main/20230127100808.png)

接着就能看到广告代码了，其中就有我们需要的`data-ad-client`和`data-ad-slot`参数

例如，我的代码是这样的红框中的就是我们需要的参数
![](https://raw.githubusercontent.com/StudyingLover/anything/main/20230127101239.png)

## 嵌入到fluid主题中
在博客根目录下找到 scripts 文件夹（不存在就创建一个），进入后任意创建一个 js 文件，比如 `inject.js`，复制以下内容：
```javascript
hexo.extend.filter.register('theme_inject', function(injects) {
	injects.bodyEnd.raw('adsense', '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxx" crossorigin="anonymous"></script>');
	injects.head.raw('adsense', '<style>ins.adsbygoogle[data-ad-status="unfilled"] { display: none !important; }</style>');
	injects.postLeft.raw('adsense', '<aside class="sidebar d-none d-xl-block" style="margin-right:-1rem;z-index:-1"><ins class="adsbygoogle" style="display:flex;justify-content:center;min-width:160px;max-width:300px;width:100%;height:600px;position:sticky;top:2rem" data-ad-client="ca-pub-xxxxxx" data-ad-slot="yyyyyy"></ins><script> (adsbygoogle = window.adsbygoogle || []).push({}); </script></aside>');
	injects.postCopyright.raw('adsense', '<div style="width:100%;display:flex;justify-content:center;margin-bottom:1.5rem"><ins class="adsbygoogle" style="display:flex;justify-content:center;max-width:845px;width:100%;height:90px" data-ad-client="ca-pub-xxxxxx" data-ad-slot="yyyyyy"></ins><script> (adsbygoogle = window.adsbygoogle || []).push({}); </script></div>');
});
```
复制之后，把其中 `ca-pub-xxxxxx` 和 `data-ad-slot="yyyyyy"` 换成我们上面获取到的参数即可。