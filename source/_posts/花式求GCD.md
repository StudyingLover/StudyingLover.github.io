---
title: 花式求GCD
banner_img: https://cdn.studyinglover.com/pic/2023/07/869e354fa5d2254251c10bc2e3cf1bef.png
date: 2023-8-2 18:46:00
tags:
- 算法
---
# 花式求GCD
今天学校实验室纳新群有同学提到了`a^=b^=a^=b​` 交换两个数的操作，我突然想到之前在知乎看到通过异或实现gcd的方法，一番翻找后没啥结果，便去问了下认识的oi大佬有没有一行求gcd的算法。


大佬很快给出了一个函数`int gcd(int a,int b){return y?gcd(y,x%y):x;}` 真的就是一行，完整的代码就是下面这个

```cpp
#include <bits/stdc++.h>
using namespace std;
int gcd(int x, int y) { return y ? gcd(y, x % y) : x; }
int main(){
	int a,b;
	a=10;
	b=20;
	a = gcd(a,b);
	cout<<a<<endl;
	return 0;
}

```

但是我一像不对啊，我的异或呢？我又问了一下，大佬给了我一个截图
![](https://cdn.studyinglover.com/pic/2023/08/07b57e65da92d9c19bb82d740132f07c.png)

就是这个神奇的写法

这段代码的实现方式是，使用异或运算符（^）和取模运算符（%）来交换变量a和b的值。具体来说，代码中的while循环会一直执行，直到b的值为0为止。在每次循环中，代码会先将a对b取模，然后将结果赋值给a，接着将b对a取模，然后将结果赋值给b，最后使用异或运算符交换a和b的值。这样，当循环结束时，a和b的值就被成功地交换了。(来自copilot chat)

```cpp
#include <bits/stdc++.h>
using namespace std;
int main(){
	int a,b;
	a=10;
	b=20;
	while(b^=a^=b^=a%=b);
	cout<<a<<endl;
	return 0;
}

```