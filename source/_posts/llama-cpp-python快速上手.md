---
title: llama-cpp-python快速上手
banner_img: https://cdn.studyinglover.com/pic/2023/07/90de842ec72a1235720697dec6e79d74.png
date: 2023-7-28 17:23:00
---
# llama-cpp-python快速上手
## 搭建环境
项目地址[GitHub](https://github.com/abetlen/llama-cpp-python),有能力的话可以直接阅读原始文档。

首先按照文档，安装llama-cpp-python
```bash
pip install llama-cpp-python
```

接下来，你可能缺一些依赖，这一点在文档中没有涉及但是我整理了我缺少的依赖，依次运行即可。
```bash
pip install uvicorn
pip install anyio
pip install starlette
pip install fastapi
pip install pydantic_settings
pip install sse_starlette
```

## 高级API和低级API

### 高级API
高级 API 通过`Llama`类提供简单的托管接口。请将`./models/7B/ggml-model.bin` 换成你的模型的路径，下同。
```python
from llama_cpp import Llama
llm = Llama(model_path="./models/7B/ggml-model.bin")
output = llm("Q: Name the planets in the solar system? A: ", max_tokens=32, stop=["Q:", "\n"], echo=True)
print(output)
```
返回值如下
```
{
  "id": "cmpl-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "object": "text_completion",
  "created": 1679561337,
  "model": "./models/7B/ggml-model.bin",
  "choices": [
    {
      "text": "Q: Name the planets in the solar system? A: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto.",
      "index": 0,
      "logprobs": None,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 14,
    "completion_tokens": 28,
    "total_tokens": 42
  }
}
```

### 低级API
低级 API 直接[`ctypes`](https://docs.python.org/3/library/ctypes.html)绑定到`llama.cpp`. 整个低级 API 可以在[llama_cpp/llama_cpp.py](https://github.com/abetlen/llama-cpp-python/blob/master/llama_cpp/llama_cpp.py)中找到，并直接镜像[llama.h](https://github.com/ggerganov/llama.cpp/blob/master/llama.h)中的 C API 。

```python
import llama_cpp
import ctypes
params = llama_cpp.llama_context_default_params()
# use bytes for char * params
ctx = llama_cpp.llama_init_from_file(b"./models/7b/ggml-model.bin", params)
max_tokens = params.n_ctx
# use ctypes arrays for array params
tokens = (llama_cpp.llama_token * int(max_tokens))()
n_tokens = llama_cpp.llama_tokenize(ctx, b"Q: Name the planets in the solar system? A: ", tokens, max_tokens, add_bos=llama_cpp.c_bool(True))
llama_cpp.llama_free(ctx)
```

## 搭建与openai接口兼容的服务器接口
`llama-cpp-python`提供一个 Web 服务器，旨在作为 OpenAI API 的直接替代品。
```bash 
python3 -m llama_cpp.server --model models/7B/ggml-model.bin
```
你可以在上面的命令运行成功后访问[文档](http://localhost:8000/docs)

文档是全英的，想要对话接口的话我用python写了个示例
```python
import requests
  
url = 'http://localhost:8000/v1/chat/completions'
headers = {
	'accept': 'application/json',
	'Content-Type': 'application/json'
}
data = {
	'messages': [
		{
		'content': 'You are a helpful assistant.',
		'role': 'system'
		},
		{
		'content': 'What is the capital of France?',
		'role': 'user'
		}
	]
}
  
response = requests.post(url, headers=headers, json=data)
print(response.json())
print(response.json()['choices'][0]['message']['content'])
```

如果你想自建一个接口，请在遵守相关法律法规的情况下，在自己的服务器上启动相关服务，并反向代理`http://localhost:8000` 地址。例如你反向代理到了`https://example.com`,那你的对话地址就是`https://example.com/v1/chat/completions`。当你想用gpt的时候就不用看openai的脸色了，直接部署一个自己的接口自己请求，或者调用openai库的时候apibase写自己的接口。
