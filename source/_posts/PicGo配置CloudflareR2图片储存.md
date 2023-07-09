---
title: PicGo配置CloudflareR2图片储存
banner_img: https://cdn.studyinglover.com/pic/2023/07/1a1e2c3b47a01b847e8ac9e962764c89.png
date: 2023-7-9 20:24:00
categories:
- 踩坑
---
# PicGo配置CloudflareR2图片储存
首先需要安装PicGo,并购买CloudFlare R2。CloudFlare R2选择免费计划即可，只是需要绑定银行卡或者paypal(淘宝两块钱解君忧)。

在R2的管理界面选择管理R2 API Tokens，
![image.png](https://cdn.studyinglover.com/pic/2023/07/c5fa048794dc5eab45d6e83efef1df8e.png)

创建一个API Token
![image.png](https://cdn.studyinglover.com/pic/2023/07/eed2d1b23fb75a7abc5ac334688baba7.png)
注意选择权限为edit
![image.png](https://cdn.studyinglover.com/pic/2023/07/0a7ece4445c1a2f190adc2dd82351f62.png)

创建API Token之后，保存Access Key ID和Secret Access Key。

接下来返回R2的管理界面，创建一个储存桶
![image.png](https://cdn.studyinglover.com/pic/2023/07/6de3892cb5f8a0bf1c53bb83d2070ca6.png)
填入名字并创建桶，点击进入储存桶的管理界面，进入setting界面。
![image.png](https://cdn.studyinglover.com/pic/2023/07/674ad9e98a4d4c064cd135353f967fce.png)

自定义自己的域名并允许公开访问，选择Connect Domain绑定到自己的域名，选择AllowAccess允许公开访问。
![image.png](https://cdn.studyinglover.com/pic/2023/07/135bb11e6b475ed4d7acdf491003cf52.png)

接下来打开PicGo,安装s3插件
![image.png](https://cdn.studyinglover.com/pic/2023/07/bc0d82dee02bc1a2b114477b827b125c.png)

应用密钥ID和应用密钥填入在API Token获取的Access Key ID和Secret Access Key，桶名填入创建的桶的名称，自定义节点填入储存桶管理界面中途中对应的路径。自定义域名填入前面绑定的自己的域名。
![image.png](https://cdn.studyinglover.com/pic/2023/07/0c0cc997c92cd807ecb48c3b2b08e394.png)

尝试上传不出意外就上传成功了。