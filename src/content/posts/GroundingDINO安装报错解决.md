---
title: GroundingDINO安装报错解决
banner_img: https://drive.studyinglover.com/api/raw/?path=/photos/blog/background/1679397024795.jpeg
date: 2023-6-21 17:25:00
categories:
- 踩坑
---
# GroundingDINO安装报错解决

在安装会遇到这个错误
```bash
  ERROR: Command errored out with exit status 1:
   command: /usr/bin/python3 /tmp/tmpmhvo4wyp build_wheel /tmp/tmp3a4xwmi4
       cwd: /tmp/pip-install-x0mg8qpf/pycocotools
  Complete output (77 lines):
  running bdist_wheel
  running build
  running build_py
  creating build
  creating build/lib.linux-x86_64-cpython-38
  creating build/lib.linux-x86_64-cpython-38/pycocotools
  copying pycocotools/coco.py -> build/lib.linux-x86_64-cpython-38/pycocotools
  copying pycocotools/mask.py -> build/lib.linux-x86_64-cpython-38/pycocotools
  copying pycocotools/cocoeval.py -> build/lib.linux-x86_64-cpython-38/pycocotools
  copying pycocotools/__init__.py -> build/lib.linux-x86_64-cpython-38/pycocotools
  running build_ext
  cythoning pycocotools/_mask.pyx to pycocotools/_mask.c
  building 'pycocotools._mask' extension
  creating build/temp.linux-x86_64-cpython-38
  creating build/temp.linux-x86_64-cpython-38/common
  creating build/temp.linux-x86_64-cpython-38/pycocotools
  x86_64-linux-gnu-gcc -pthread -Wno-unused-result -Wsign-compare -DNDEBUG -g -fwrapv -O2 -Wall -g -fstack-protector-strong -Wformat -Werror=format-security -g -fwrapv -O2 -fPIC -I/tmp/pip-build-env-xkmgfc0t/overlay/lib/python3.8/site-packages/numpy/core/include -I./common -I/usr/include/python3.8 -c ./common/maskApi.c -o build/temp.linux-x86_64-cpython-38/./common/maskApi.o -Wno-cpp -Wno-unused-function -std=c99
  ./common/maskApi.c: In function ‘rleToBbox’:
  ./common/maskApi.c:151:32: warning: unused variable ‘xp’ [-Wunused-variable]
    151 |     uint h, w, xs, ys, xe, ye, xp, cc; siz j, m;
        |                                ^~
  ./common/maskApi.c: In function ‘rleFrPoly’:
  ./common/maskApi.c:197:3: warning: this ‘for’ clause does not guard... [-Wmisleading-indentation]
    197 |   for(j=0; j<k; j++) x[j]=(int)(scale*xy[j*2+0]+.5); x[k]=x[0];
        |   ^~~
  ./common/maskApi.c:197:54: note: ...this statement, but the latter is misleadingly indented as if it were guarded by the ‘for’
    197 |   for(j=0; j<k; j++) x[j]=(int)(scale*xy[j*2+0]+.5); x[k]=x[0];
        |                                                      ^
  ./common/maskApi.c:198:3: warning: this ‘for’ clause does not guard... [-Wmisleading-indentation]
    198 |   for(j=0; j<k; j++) y[j]=(int)(scale*xy[j*2+1]+.5); y[k]=y[0];
        |   ^~~
  ./common/maskApi.c:198:54: note: ...this statement, but the latter is misleadingly indented as if it were guarded by the ‘for’
    198 |   for(j=0; j<k; j++) y[j]=(int)(scale*xy[j*2+1]+.5); y[k]=y[0];
        |                                                      ^
  ./common/maskApi.c: In function ‘rleToString’:
  ./common/maskApi.c:243:7: warning: this ‘if’ clause does not guard... [-Wmisleading-indentation]
    243 |       if(more) c |= 0x20; c+=48; s[p++]=c;
        |       ^~
  ./common/maskApi.c:243:27: note: ...this statement, but the latter is misleadingly indented as if it were guarded by the ‘if’
    243 |       if(more) c |= 0x20; c+=48; s[p++]=c;
        |                           ^
  ./common/maskApi.c: In function ‘rleFrString’:
  ./common/maskApi.c:251:3: warning: this ‘while’ clause does not guard... [-Wmisleading-indentation]
    251 |   while( s[m] ) m++; cnts=malloc(sizeof(uint)*m); m=0;
        |   ^~~~~
  ./common/maskApi.c:251:22: note: ...this statement, but the latter is misleadingly indented as if it were guarded by the ‘while’
    251 |   while( s[m] ) m++; cnts=malloc(sizeof(uint)*m); m=0;
        |                      ^~~~
  ./common/maskApi.c:259:5: warning: this ‘if’ clause does not guard... [-Wmisleading-indentation]
    259 |     if(m>2) x+=(long) cnts[m-2]; cnts[m++]=(uint) x;
        |     ^~
  ./common/maskApi.c:259:34: note: ...this statement, but the latter is misleadingly indented as if it were guarded by the ‘if’
    259 |     if(m>2) x+=(long) cnts[m-2]; cnts[m++]=(uint) x;
        |                                  ^~~~
  x86_64-linux-gnu-gcc -pthread -Wno-unused-result -Wsign-compare -DNDEBUG -g -fwrapv -O2 -Wall -g -fstack-protector-strong -Wformat -Werror=format-security -g -fwrapv -O2 -fPIC -I/tmp/pip-build-env-xkmgfc0t/overlay/lib/python3.8/site-packages/numpy/core/include -I./common -I/usr/include/python3.8 -c pycocotools/_mask.c -o build/temp.linux-x86_64-cpython-38/pycocotools/_mask.o -Wno-cpp -Wno-unused-function -std=c99
  pycocotools/_mask.c:6:10: fatal error: Python.h: No such file or directory
      6 | #include "Python.h"
        |          ^~~~~~~~~~
  compilation terminated.
  /tmp/pip-build-env-xkmgfc0t/overlay/lib/python3.8/site-packages/setuptools/dist.py:745: SetuptoolsDeprecationWarning: Invalid dash-separated options
  !!
  
          ********************************************************************************
          Usage of dash-separated 'index-url' will not be supported in future
          versions. Please use the underscore name 'index_url' instead.
  
          By 2023-Sep-26, you need to update your project and remove deprecated calls
          or your builds will no longer be supported.
  
          See https://setuptools.pypa.io/en/latest/userguide/declarative_config.html for details.
          ********************************************************************************
  
  !!
    opt = self.warn_dash_deprecation(opt, section)
  /tmp/pip-build-env-xkmgfc0t/overlay/lib/python3.8/site-packages/Cython/Compiler/Main.py:369: FutureWarning: Cython directive 'language_level' not set, using 2 for now (Py2). This will change in a later release! File: /tmp/pip-install-x0mg8qpf/pycocotools/pycocotools/_mask.pyx
    tree = Parsing.p_module(s, pxd, full_module_name)
  error: command '/usr/bin/x86_64-linux-gnu-gcc' failed with exit code 1
  ----------------------------------------
  ERROR: Failed building wheel for pycocotools
Failed to build pycocotools
ERROR: Could not build wheels for pycocotools which use PEP 517 and cannot be installed directly
```
细读报错，我们会发现是编译过程中少了一个`Python.h` 的头文件导致编译pycocotools失败。

我们尝试直接安装`pycocotools`

```bash
pip install pycocotools
```

会出现和上面一样的错误。

google一番,提示说`sudo apt-get install libsuitesparse-dev`

受到报错
```
 Building wheel for pycocotools (pyproject.toml) ... error
  error: subprocess-exited-with-error
  
  × Building wheel for pycocotools (pyproject.toml) did not run successfully.
  │ exit code: 1
  ╰─> [77 lines of output]
```

最后的结果依然是
```
  note: This error originates from a subprocess, and is likely not a problem with pip.
  ERROR: Failed building wheel for pycocotools
Failed to build pycocotools
ERROR: Could not build wheels for pycocotools, which is required to install pyproject.toml-based projects
```

尝试通过安装`pip install "git+https://github.com/philferriere/cocoapi.git#egg=pycocotools&subdirectory=PythonAPI"` 解决

获得报错
```
fatal: unable to access 'https://github.com/philferriere/cocoapi.git/': GnuTLS recv error (-110): The TLS connection was non-properly terminated.
  error: subprocess-exited-with-error
  
  × git clone --filter=blob:none --quiet https://github.com/philferriere/cocoapi.git /tmp/pip-install-a4vtujvc/pycocotools_f76f853260a94fd79f5ac4cef5f3a557 did not run successfully.
  │ exit code: 128
  ╰─> See above for output.
  
  note: This error originates from a subprocess, and is likely not a problem with pip.
error: subprocess-exited-with-error

× git clone --filter=blob:none --quiet https://github.com/philferriere/cocoapi.git /tmp/pip-install-a4vtujvc/pycocotools_f76f853260a94fd79f5ac4cef5f3a557 did not run successfully.
│ exit code: 128
╰─> See above for output.
```

运行`sudo apt install python3.8-dev`

然后`git clone https://github.com/cocodataset/cocoapi.git` , `cd ./cocoapi/PythonAPI` ,接下来 `make`

运行`pip install -e .` ,成功安装`pycocotools` . 

再次运行`pip install GroundingDINO` , 成功。

![image.png](https://proxy.thisis.plus/202306211724652.png)
