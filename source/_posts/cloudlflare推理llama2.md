---
title: cloudlflare推理llama2
banner_img: https://cdn.studyinglover.com/pic/2023/10/0863cb015e8d69fbce68ebe57bea96d8.jpg
date: 2023-10-11 15:32:00
categories:
- 踩坑
---
# cloudlflare推理llama2
最近，cloudlfare悄悄上线了一项新功能，全球网络上的gpu加速推理，显然的，我们可以用它推理llama2,cloudflare也提供了一个库进行推理。

新建一个cloudflare,然后，代码改成下面的，就可以进行推理了
```javascript
import { Ai } from './vendor/@cloudflare/ai.js';

export default {
  async fetch(request, env) {
    const tasks = [];
    const ai = new Ai(env.AI);

    // Get the request body
    const requestBody = await request.json();

    // messages - chat style input
    let chat = {
      messages: [
        { role: 'system', content: 'You are a helpful, kind, honest, friendly, good at writing and never fails to answer my requests immediately and with details and precision.'},
        { role: 'user', content: requestBody.prompt }
      ]
    };
    let response = await ai.run('@cf/meta/llama-2-7b-chat-int8', chat);
    tasks.push({ inputs: chat, response });

    return Response.json(tasks);
  }
};
```

我们可以测试一下,在命令行运行下面的命令，将`https://example.workers.dev/` 换成你的网址。
```bash
curl -X POST https://example.workers.dev/ -d '{"prompt":"Write a poem that talks about the connectivity cloud"}' 
```

看到类似下面的返回值代表成功
```
[{"inputs":{"messages":[{"role":"system","content":"You are a helpful, kind, honest, friendly, good at writing and never fails to answer my requests immediately and with details and precision."},{"role":"user","content":"Write a poem that talks about the connectivity cloud"}]},"response":{"response":"In the realm of the digital sky,\nWhere information flows, and data fly,\nThere's a place that brings us all together,\nA connectivity cloud, a true forever.\n\nIt's a space that's vast and wide,\nWhere thoughts and ideas collide,\nA hub of communication and exchange,\nWhere the world's voices all combine and blend.\n\nIn this cloud of connectivity,\nWe find our voices, our identity,\nA platform for sharing and growth,\nWhere our stories are told and our dreams take flight.\n\nWith just a click or tap of a key,\nWe can connect with anyone, anywhere,\nSharing laughter, love, and tears,\nIn this digital embrace, we all share.\n\nSo let us cherish this cloud of connectivity,\nThis gift that brings us all sovereignty,\nFor in its depths, we find our tribe,\nAnd our voices, heard, can never be denied.\n\nIn this cloud of connectivity,\nWe are all connected, you see,\nA global community, united and free,\nIn this digital age, where we all can be"}}]
```