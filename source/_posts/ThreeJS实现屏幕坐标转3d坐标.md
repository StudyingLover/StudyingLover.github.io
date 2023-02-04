---
title: ThreeJS实现屏幕坐标转3d坐标
banner_img: https://cloud.studyinglover.com/api/raw/?path=/photos/blog/1930f5e45b0e2da27cdca61d93aa827d.png
date: 2023-2-4 20:30:00
categories:
- 工具
tags:
- ThreeJS
---
# ThreeJS实现屏幕坐标转3d坐标

本文使用chatGPT辅助完成

在虚拟世界中，3D坐标与屏幕坐标之间的转换是一个重要的问题。使用ThreeJS开发3D场景时，经常需要将屏幕坐标转换为3D坐标。在本文中，我们将介绍如何使用ThreeJS实现屏幕坐标转3D坐标的两种方法

## 根据相机的投影矩阵和射线拾取
在ThreeJS中，相机的投影矩阵是一个4x4的矩阵，它将3D坐标转换为屏幕坐标。我们可以使用这个矩阵将屏幕坐标转换为3D坐标。
官方为我们提供了一个接口`vector.unproject(camera)`,它可以将屏幕坐标转换为3D坐标。但是这个接口只能将屏幕坐标转换为相机坐标系下的3D坐标，如果我们需要将屏幕坐标转换为世界坐标系下的3D坐标，我们需要使用`vector.applyMatrix4(camera.matrixWorldInverse)`将相机坐标系下的3D坐标转换为世界坐标系下的3D坐标。(这里代码本来不是这么写的，但是copilot给了我好多提示，我就照着他的提示改了改，如果你发现代码有问题，问问chatGPT吧)

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
这里的`hyper_z`网上很多教程认为是写0.5,但是我实际试了一下，发现效果很差，就把他改成了一个超参数。后来在一位不能透露姓名的大佬的帮助下，得知这个参数的值应该写成1。我试了下，勉强可以得到预期的效果

## 通过深度图采样，shader改深度缓冲
这种方法是通过深度图采样，shader改深度缓冲，然后再通过深度缓冲得到3D坐标。这种方法的优点是可以得到更精确的3D坐标，但是缺点是需要使用shader，而且需要修改深度缓冲，可能会影响性能。

感谢chatGPT，我只需要把我需要的内容告诉他，他就会给我写一个完整的代码。
```js
function convert2Dto3D(mouseX, mouseY, camera, width, height, scene) {
        // 构建纹理
        var depthTarget = new THREE.WebGLRenderTarget(width, height);
        depthTarget.texture.minFilter = THREE.LinearFilter;

        // 渲染深度图
        renderer.render(scene, camera, depthTarget);

        // 创建着色器
        var material = new THREE.ShaderMaterial({
            uniforms: {
                mouse: { value: new THREE.Vector2(mouseX, mouseY) },
                depthMap: { value: depthTarget.texture },
                projectionMatrix: { value: camera.projectionMatrix },
                viewMatrix: { value: camera.matrixWorldInverse }
            },
            vertexShader: `
                uniform vec2 mouse;
                uniform mat4 projectionMatrix;
                uniform mat4 viewMatrix;
                uniform sampler2D depthMap;
                varying vec4 pos;
                void main() {
                    pos = vec4(position, 1.0);
                    gl_Position = projectionMatrix * viewMatrix * pos;
                }
            `,
            fragmentShader: `
                uniform vec2 mouse;
                uniform sampler2D depthMap;
                varying vec4 pos;
                void main() {
                    float depth = texture2D(depthMap, mouse).r;
                    vec4 viewPos = vec4(mouse * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
                    vec4 worldPos = viewMatrix * viewPos;
                    worldPos /= worldPos.w;
                    gl_FragColor = vec4(worldPos.xyz, 1.0);
                }
            `
        });

        // 创建一个平面作为渲染目标
        var plane = new THREE.PlaneBufferGeometry(width, height);
        var mesh = new THREE.Mesh(plane, material);
        scene.add(mesh);

        // 渲染一次着色器并获取结果
        renderer.render(scene, camera);
        var pixelBuffer = new Uint8Array(4);
        renderer.readRenderTargetPixels(depthTarget, mouseX, height - mouseY, 1, 1, pixelBuffer);
        var worldPos = new THREE.Vector3(
            (pixelBuffer[0] / 255) * 2 - 1,
            (pixelBuffer[1] / 255) * 2 - 1,
            (pixelBuffer[2] / 255) * 2 - 1
        );
        worldPos.applyMatrix4(camera.matrixWorldInverse);
        scene.remove(mesh);
        return worldPos;
    },

    //获取触摸点的坐标并转换为ThreeJS中的坐标
    touch_crash_detect: function touch_crash_detect() {
        window.addEventListener('touchmove', (event) => {
            // screen3D_to_3DCoord(event.touches[0].clientX, event.touches[0].clientY,camera, window.innerWidth, window.innerHeight);
            let pos = space_pos_convert.get3DPosition(event.touches[0].clientX, event.touches[0].clientY, camera, scene, 1);
            if (pos.y != 0) {
                pos.y = 0;
            }
            return pos;
            // playerMesh.position.set(pos.x, pos.y, pos.z);
        });
    }
```

