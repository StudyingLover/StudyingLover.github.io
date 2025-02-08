---
title: clip-interrogator代码解析
banner_img: https://proxy.thisis.plus/202306232259566.png
date: 2023-6-23 22:59:40
tag:
- 文字生成图片
---
# clip-interrogator代码解析
clip-interrogator 的的主要代码在仓库的`./clip-interrogator`  文件夹下
```
.
├── clip_interrogator.py
├── data
│   ├── artists.txt
│   ├── flavors.txt
│   ├── mediums.txt
│   ├── movements.txt
│   └── negative.txt
└── __init__.py

```

这里主要解析`clip-interrogator.py` 文件。

## __init__.py
```python
from .clip_interrogator import Config, Interrogator, LabelTable, list_caption_models, list_clip_models, load_list

__version__ = '0.6.0'
__author__ = 'pharmapsychotic'
```

这个 `__init__.py` 文件的作用是在包被导入时执行初始化操作，并提供了版本号和作者信息。

## clip_interrogator.py
文件的大致结构是这样的
```python
import 需要的库

CAPTION_MODELS = {
'blip-base': 'Salesforce/blip-image-captioning-base', # 990MB
'blip-large': 'Salesforce/blip-image-captioning-large', # 1.9GB
'blip2-2.7b': 'Salesforce/blip2-opt-2.7b', # 15.5GB
'blip2-flan-t5-xl': 'Salesforce/blip2-flan-t5-xl', # 15.77GB
'git-large-coco': 'microsoft/git-large-coco', # 1.58GB
}

CACHE_URL_BASE = 'https://huggingface.co/pharma/ci-preprocess/resolve/main/'

@dataclass
class Config:
    具体实现
    
class Interrogator():
    具体实现
    
class LabelTable():
    具体实现

def _download_file(url: str, filepath: str, chunk_size: int = 4*1024*1024, quiet: bool = False):
    具体实现

def _merge_tables(tables: List[LabelTable], ci: Interrogator) -> LabelTable:
    具体实现

def _prompt_at_max_len(text: str, tokenize) -> bool:
    具体实现

def _truncate_to_fit(text: str, tokenize) -> str:
    具体实现

def list_caption_models() -> List[str]:
    具体实现

def list_clip_models() -> List[str]:
    具体实现

def load_list(data_path: str, filename: Optional[str] = None) -> List[str]:
    具体实现
```

`CAPTION_MODELS` 定义了各个所需要的模型在huggingface 地址。`CACHE_URL_BASE` 是缓存地址

### Config class
首先定义了CLIP和BILP模型
```python
caption_model = None
caption_processor = None
clip_model = None
clip_preprocess = None
```

接下来对BLIP和CLIP进行了详细的设置2
```python
# blip settings
caption_max_length: int = 32
caption_model_name: Optional[str] = 'blip-large' # use a key from CAPTION_MODELS or None
caption_offload: bool = False
  
# clip settings
clip_model_name: str = 'ViT-L-14/openai'
clip_model_path: Optional[str] = None
clip_offload: bool = False
```

这段代码是Config类中与Interrogator类相关的配置参数。

接下来定义了interrogator的相关设置
```python
cache_path: str = 'cache' # 存储缓存的文本嵌入的路径
download_cache: bool = True # 是否从huggingface下载缓存的嵌入向量
chunk_size: int = 2048 # CLIP的批处理大小
data_path: str = os.path.join(os.path.dirname(__file__), 'data')# 数据文件的路径
device: str = ("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")
flavor_intermediate_count: int = 2048
quiet: bool = False # 是否显示进度条
```

`apply_low_vram_defaults`方法，用于将配置参数设置为适合低显存设备的默认值。在该方法中，将一些参数设置为较小的值，以减少显存的使用。

### Interrogator class
```python
def __init__(self, config: Config):
	self.config = config
	self.device = config.device
	self.dtype = torch.float16 if self.device == 'cuda' else torch.float32
	self.caption_offloaded = True
	self.clip_offloaded = True
	self.load_caption_model()
	self.load_clip_model()
```
继承了`Config` 类中的一些配置。

#### load_caption_model

这个方法用于加载图像描述模型。首先判断配置中是否直接传入了图像描述模型对象，并且是否指定了图像描述模型名称。如果没有直接传入模型对象并且指定了模型名称，则根据模型名称加载对应的模型。加载过程中根据模型名称的不同选择不同的加载方式。加载完成后，将模型设置为eval模式，并根据配置决定是否将模型移动到指定的设备上

#### load_clip_model

这个方法用于加载CLIP模型。首先根据配置中指定的CLIP模型名称解析出模型名称和预训练模型名称。然后判断配置中是否直接传入了CLIP模型对象。如果没有直接传入模型对象，则根据模型名称和预训练模型名称加载模型。加载过程中会调用`open_clip.create_model_and_transforms()`方法创建模型和预处理函数，并设置模型为eval模式。加载完成后，将模型和预处理函数保存到对应的属性中。

接下来，根据配置中的数据路径加载一些标签数据，并创建`LabelTable`对象。`LabelTable`类用于管理标签和对应的嵌入向量。这里创建了artists、flavors、mediums、movements、trendings和negative等LabelTable对象。

最后，打印加载CLIP模型和数据所花费的时间。

#### chain
这个方法用于它用于在一组短语中选择最佳的短语，以构建一个完整的提示。

首先调用_prepare_clip()方法，准备CLIP模型。

然后，将短语列表转换为一个集合，方便操作。如果没有指定最佳提示，则通过调用rank_top()方法选择当前短语列表中与图像特征最相似的短语作为最佳提示，并计算其相似度。然后从短语集合中移除最佳提示。

接下来，使用curr_prompt和curr_sim变量保存当前的提示和相似度。

定义了一个名为check的内部函数，用于检查给定的附加短语是否应该成为当前提示的一部分。该函数会根据相似度比较结果更新最佳提示和最佳相似度，并判断是否需要更新当前提示。

使用一个循环遍历max_count次，每次迭代中选择当前短语列表中与当前提示加上附加短语后最相似的短语作为最佳短语。然后将该短语的一部分（从curr_prompt的长度加2开始）作为附加短语。调用check()函数进行相似度比较和更新。

在循环过程中，如果当前提示已经达到了最大长度，则停止迭代。最后，返回最佳提示。

#### generate_caption
使用BILP生成图像的描述。它首先对图像进行预处理，然后使用图像描述模型生成描述的tokens，最后将tokens解码为文本描述。

#### image_to_features
使用CLIP的图像编码器将图片转换成torch格式的特征

#### interrogate
`interrogate_classic` 首先生成一个标准格式的提示，描述图像，然后列出艺术家、趋势、风格和口味等文本修饰符。它使用了mediums、artists、trendings、movements和flavors等LabelTable对象来选择相应的修饰符。

`interrogate_fast` 在生成的描述后面简单地添加排名靠前的词语。它通常比经典模式产生更好的生成提示和图像之间的相似度，但提示的可读性较差。它使用了artists、flavors、mediums、movements和trendings等LabelTable对象来选择排名靠前的词语。

`interrogate_negative` 主要生成负面词汇，将与图像最不相似的词语连接在一起。它可以用于构建与正面提示相对应的负面提示，并且通常可以改善生成图像的结果，特别是在使用稳定扩散2（Stable Diffusion 2）时。它使用了flavors和negative等LabelTable对象来选择最不相似的词语。

`interrogate` 会生成一个完整的提示。首先生成一个基于图像的描述，然后根据图像特征和LabelTable对象生成一组修饰符。然后使用chain方法选择最佳的修饰符，并根据相似度和一些条件选择最佳提示。最后，根据生成的多个提示的相似度，选择最终的生成提示。

#### _prepare_caption
用于加载BLIP模型。

#### _prepare_clip
用于加载CLIP模型。

#### rank_top
这个方法用于对文本进行排名，并返回排名最高的文本。

首先加载CLIP模型。使用tokenize方法将文本数组转换为文本tokens，并将其移动到设备上。

然后，使用`clip_model`的`encode_text`方法对文本tokens进行编码，得到文本的特征向量。对特征向量进行归一化处理，使其长度为1。接着，计算文本特征向量与图像特征向量之间的相似度。通过计算特征向量的点积得到相似度。如果`reverse`为`True`，则将相似度取负，以实现按相似度降序排列。最后，返回排名最高的文本，即相似度最大的文本。

#### similarity和similarities
通过计算点积的方式计算了相似度

### LabelTable class
这个类创建标签，并对标签进行排名

#### __init__ 
```python
def __init__(self, labels:List[str], desc:str, ci: Interrogator):
clip_model, config = ci.clip_model, ci.config
self.chunk_size = config.chunk_size
self.config = config
self.device = config.device
self.embeds = []
self.labels = labels
self.tokenize = ci.tokenize
  
hash = hashlib.sha256(",".join(labels).encode()).hexdigest()
sanitized_name = self.config.clip_model_name.replace('/', '_').replace('@', '_')
self._load_cached(desc, hash, sanitized_name)
  
if len(self.labels) != len(self.embeds):
self.embeds = []
chunks = np.array_split(self.labels, max(1, len(self.labels)/config.chunk_size))
for chunk in tqdm(chunks, desc=f"Preprocessing {desc}" if desc else None, disable=self.config.quiet):
text_tokens = self.tokenize(chunk).to(self.device)
with torch.no_grad(), torch.cuda.amp.autocast():
text_features = clip_model.encode_text(text_tokens)
text_features /= text_features.norm(dim=-1, keepdim=True)
text_features = text_features.half().cpu().numpy()
for i in range(text_features.shape[0]):
self.embeds.append(text_features[i])
  
if desc and self.config.cache_path:
os.makedirs(self.config.cache_path, exist_ok=True)
cache_filepath = os.path.join(self.config.cache_path, f"{sanitized_name}_{desc}.safetensors")
tensors = {
"embeds": np.stack(self.embeds),
"hash": np.array([ord(c) for c in hash], dtype=np.int8)
}
save_file(tensors, cache_filepath)
  
if self.device == 'cpu' or self.device == torch.device('cpu'):
self.embeds = [e.astype(np.float32) for e in self.embeds]
```
继承了`Interrogator` 中的一些内容，同时对embeds 做了预处理。

#### _load_cached

用于加载缓存的嵌入向量。

#### _rank和rank

用于对图像特征和文本嵌入向量进行排名。`_rank`方法计算图像特征与文本嵌入向量之间的相似度，并返回排名最高的文本索引。`rank`方法根据`chunk_size`的大小，将文本嵌入向量分成多个批次进行排名，然后返回排名最高的文本标签。

## data
存储了常用的文字生成图片的prompt

## clip-interrogator究竟做了什么
首先，clip-interrogator会使用BILP生成一段对图片的自然语言描述。

接下来会根据四种模式，从data文件夹下的txt文件中组合出文字生成图片常用的prompt,通过CLIP进行编码，然后将图片也用CLIP进行编码，计算出相似度最大的一组prompt,和BILP生成的prompt拼接到一起，就得到了一组prompt。
