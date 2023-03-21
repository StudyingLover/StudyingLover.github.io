---
title: copliot才是代码开发神器
banner_img: https://drive.studyinglover.com/api/raw/?path=/photos/blog/background/d72965259b2c152ec5b59f33d3895a3c.png
date: 2023-2-4 21:45:00
categories:
- 工具
tags:
- Microsoft
---
# copliot才是代码开发神器
本文使用copilot和chatGPT辅助完成

copilot是微软的AI代码生成器，可以帮助我们快速完成代码编写(这句copilot简介是copilot写的)。在openai的chatGPT出现后，copilot的风头有所下降，直到刚才……
几分钟前我在写我的博客[ThreeJS实现屏幕坐标转3d坐标](https://studyinglover.com/2023/02/04/ThreeJS%E5%AE%9E%E7%8E%B0%E5%B1%8F%E5%B9%95%E5%9D%90%E6%A0%87%E8%BD%AC3d%E5%9D%90%E6%A0%87/)时，原本的第一段代码是这样的：
```js
function get3DPosition(x, y, camera, scene, hyper_z) {
        var vector = new THREE.Vector3();
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        vector.x = (x / window.innerWidth) * 2 - 1;
        vector.y = - (y / window.innerHeight) * 2 + 1;
        vector.z = hyper_z;

        // unproject the vector
        vector.unproject(camera);

        // calculate the ray from the camera to the vector
        var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

        // check for intersection with objects in the scene
        var intersects = ray.intersectObjects(scene.children);
        if (intersects.length > 0) {
            return intersects[0].point;
        }
        else {
            return null;
        }
    }
```
正当我写完
> 官方为我们提供了一个接口`vector.unproject(camera)`
打算粘贴上我的代码时，copilot突然给了我一大段代码提示，并给出了我一段代码

emmmmmmmmmm,当时的我是有点懵的，我回去看了看当时这段代码的目的，发现这段代码的目的(实不相瞒写到这copilot又给我一段提示(实不相瞒写到这copilot又给我一段提示(......)))先获取点击的坐标点，再获取我点击的3d物体的名称。所以前半部分没问题，真正要改的是后部分。更改后的代码如下：
```js
function screenToWorld(screenX, screenY, camera，hyper_z) {
    const vector = new THREE.Vector3();
    vector.set(
        (screenX / window.innerWidth) * 2 - 1,
        -(screenY / window.innerHeight) * 2 + 1,
        hyper_z
    );
    vector.unproject(camera);
    vector.applyMatrix4(camera.matrixWorldInverse);
    return vector;
}
```

你以为结束了吗，当我继续往下写我的博客，写道
> 这里的`hyper_z`网上很多教程认为是写0.5,

copilot又给我一段代码提示，，这次的提示是这样的
![](https://cdn.jsdelivr.net/gh/StudyingLover/anything/20230204214713.png)
还好还好，这次代码的目的没搞错，只是整个代码都可能写错了而已……

经过一番思考，我决定继续按照原先的代码写，因为我已经尝试了代码的效果，勉强可以达到我们的要求。

最后，我想说的是，copilot真的是一个神器，但是要注意，它只是一个辅助工具，不要完全依赖它，因为它可能会给你一些错误的代码提示，这时候你就要自己去思考了。(这段话还是copilot写的)

总而言之，Copilot是代码开发领域中高效且创新的工具。它具有易于使用的界面和先进的功能，已被证明是开发人员的游戏规则改变者，并被广泛认为是最终的代码开发工具。无论您是经验丰富的程序员还是刚刚入门，Copilot都提供了您需要的工具，可以比以往更快、更高效地完成工作。(这段话是chatGPT写的)