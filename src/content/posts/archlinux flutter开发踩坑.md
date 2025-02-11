---
title: archlinux flutter开发踩坑
banner_img: https://cdn.studyinglover.com/pic/2024/02/f97c1d1abcf0ccef12d75c12f2201d85.png
index_img: https://cdn.studyinglover.com/pic/2024/02/f97c1d1abcf0ccef12d75c12f2201d85.png
date: 2024-2-10 22:37:00
tags:
  - 踩坑
  - flutter
  - archlinux
---

# archlinux flutter开发踩坑

archlinux是个好东西，但是开发flutter坑不少。2023年5月我配置了flutter,后来用得不多，23年11月还尝试过但是失败，最近又要使用，就来解决下。

## 20230210

今天需要写一个手机app,突然发现构建不出来了，报错

```
> Failed to create parent directory '/opt/flutter/packages/flutter_tools/gradle/.gradle' when creating directory '/opt/flutter/packages/flutter_tools/gradle/.gradle/buildOutputCleanup'

* Try:
> Run with --stacktrace option to get the stack trace.
> Run with --info or --debug option to get more log output.
> Run with --scan to get full insights.

* Get more help at https://help.gradle.org

BUILD FAILED in 48s
Exception: Gradle task assembleDebug failed with exit code 1
```

你他妈别说，这问题还麻烦，只看这个还看不出来

先sudo运行一下，运行的时候保留环境变量

```bash
sudo -E flutter run
```

失败了，同样问题。然后单独在Android下面跑一个`./gradlew clean`

报错

```
Welcome to Gradle 7.5! Here are the highlights of this release: - Support for Java 18 - Support for building with Groovy 4 - Much more responsive continuous builds - Improved diagnostics for dependency resolution For more details see https://docs.gradle.org/7.5/release-notes.html Starting a Gradle Daemon, 1 incompatible Daemon could not be reused, use --status for details FAILURE: Build failed with an exception. * Where: Settings file '/home/client/android/settings.gradle' line: 25 * What went wrong: Error resolving plugin [id: 'dev.flutter.flutter-plugin-loader', version: '1.0.0'] > A problem occurred configuring project ':gradle'. > Could not create service of type OutputFilesRepository using ExecutionGradleServices.createOutputFilesRepository(). > java.io.FileNotFoundException: /opt/flutter/packages/flutter_tools/gradle/.gradle/buildOutputCleanup/buildOutputCleanup.lock (权限不够) * Try: > Run with --stacktrace option to get the stack trace. > Run with --info or --debug option to get more log output. > Run with --scan to get full insights. * Get more help at https://help.gradle.org BUILD FAILED in 1s
```

写的很明显权限不够，给当前用户上权限

```bash
sudo chown -R $(whoami) /opt/flutter
```

再次运行

```
FAILURE: Build failed with an exception.

* What went wrong:
Could not resolve all files for configuration 'classpath'.
> Could not resolve com.android.tools:sdk-common:30.3.0.
  Required by:
      unspecified:unspecified:unspecified > com.android.application:com.android.application.gradle.plugin:7.3.0 > com.android.tools.build:gradle:7.3.0
      unspecified:unspecified:unspecified > com.android.application:com.android.application.gradle.plugin:7.3.0 > com.android.tools.build:gradle:7.3.0 > com.android.tools.lint:lint-model:30.3.0
      unspecified:unspecified:unspecified > com.android.application:com.android.application.gradle.plugin:7.3.0 > com.android.tools.build:gradle:7.3.0 > com.android.tools.build:builder:7.3.0
      unspecified:unspecified:unspecified > com.android.application:com.android.application.gradle.plugin:7.3.0 > com.android.tools.build:gradle:7.3.0 > com.android.tools.build:builder:7.3.0 > com.android.tools.build:manifest-merger:30.3.0
   > Could not resolve com.android.tools:sdk-common:30.3.0.
      > Could not get resource 'https://dl.google.com/dl/android/maven2/com/android/tools/sdk-common/30.3.0/sdk-common-30.3.0.pom'.
         > Could not GET 'https://dl.google.com/dl/android/maven2/com/android/tools/sdk-common/30.3.0/sdk-common-30.3.0.pom'.
            > The server may not support the client's requested TLS protocol versions: (TLSv1.2, TLSv1.3). You may need to configure the client to allow other protocols to be used. See: https://docs.gradle.org/7.5/userguide/build_environment.html#gradle_system_properties
               > Remote host terminated the handshake
> Could not resolve com.android.tools:sdklib:30.3.0.
  Required by:
      unspecified:unspecified:unspecified > com.android.application:com.android.application.gradle.plugin:7.3.0 > com.android.tools.build:gradle:7.3.0
      unspecified:unspecified:unspecified > com.android.application:com.android.application.gradle.plugin:7.3.0 > com.android.tools.build:gradle:7.3.0 > com.android.tools.build:builder:7.3.0
      unspecified:unspecified:unspecified > com.android.application:com.android.application.gradle.plugin:7.3.0 > com.android.tools.build:gradle:7.3.0 > com.android.tools.build:builder:7.3.0 > com.android.tools.build:manifest-merger:30.3.0
   > Could not resolve com.android.tools:sdklib:30.3.0.
      > Could not get resource 'https://dl.google.com/dl/android/maven2/com/android/tools/sdklib/30.3.0/sdklib-30.3.0.pom'.
         > Could not GET 'https://dl.google.com/dl/android/maven2/com/android/tools/sdklib/30.3.0/sdklib-30.3.0.pom'.
            > The server may not support the client's requested TLS protocol versions: (TLSv1.2, TLSv1.3). You may need to configure the client to allow other protocols to be used. See: https://docs.gradle.org/7.5/userguide/build_environment.html#gradle_system_properties
               > Remote host terminated the handshake
> Could not resolve com.android.tools:repository:30.3.0.
  Required by:
      unspecified:unspecified:unspecified > com.android.application:com.android.application.gradle.plugin:7.3.0 > com.android.tools.build:gradle:7.3.0
   > Could not resolve com.android.tools:repository:30.3.0.
      > Could not get resource 'https://dl.google.com/dl/android/maven2/com/android/tools/repository/30.3.0/repository-30.3.0.pom'.
         > Could not GET 'https://dl.google.com/dl/android/maven2/com/android/tools/repository/30.3.0/repository-30.3.0.pom'.
            > The server may not support the client's requested TLS protocol versions: (TLSv1.2, TLSv1.3). You may need to configure the client to allow other protocols to be used. See: https://docs.gradle.org/7.5/userguide/build_environment.html#gradle_system_properties
               > Remote host terminated the handshake
> Could not resolve com.android.tools.build:aaptcompiler:7.3.0.
  Required by:
      unspecified:unspecified:unspecified > com.android.application:com.android.application.gradle.plugin:7.3.0 > com.android.tools.build:gradle:7.3.0
   > Could not resolve com.android.tools.build:aaptcompiler:7.3.0.
      > Could not get resource 'https://dl.google.com/dl/android/maven2/com/android/tools/build/aaptcompiler/7.3.0/aaptcompiler-7.3.0.pom'.
         > Could not GET 'https://dl.google.com/dl/android/maven2/com/android/tools/build/aaptcompiler/7.3.0/aaptcompiler-7.3.0.pom'.
            > The server may not support the client's requested TLS protocol versions: (TLSv1.2, TLSv1.3). You may need to configure the client to allow other protocols to be used. See: https://docs.gradle.org/7.5/userguide/build_environment.html#gradle_system_properties
               > Remote host terminated the handshake
> Could not resolve com.android.tools.lint:lint-typedef-remover:30.3.0.
  Required by:
      unspecified:unspecified:unspecified > com.android.application:com.android.application.gradle.plugin:7.3.0 > com.android.tools.build:gradle:7.3.0
   > Could not resolve com.android.tools.lint:lint-typedef-remover:30.3.0.
      > Could not get resource 'https://dl.google.com/dl/android/maven2/com/android/tools/lint/lint-typedef-remover/30.3.0/lint-typedef-remover-30.3.0.pom'.
         > Could not GET 'https://dl.google.com/dl/android/maven2/com/android/tools/lint/lint-typedef-remover/30.3.0/lint-typedef-remover-30.3.0.pom'.
            > The server may not support the client's requested TLS protocol versions: (TLSv1.2, TLSv1.3). You may need to configure the client to allow other protocols to be used. See: https://docs.gradle.org/7.5/userguide/build_environment.html#gradle_system_properties
               > Remote host terminated the handshake
> Could not resolve com.android.databinding:baseLibrary:7.3.0.
  Required by:
      unspecified:unspecified:unspecified > com.android.application:com.android.application.gradle.plugin:7.3.0 > com.android.tools.build:gradle:7.3.0
      unspecified:unspecified:unspecified > com.android.application:com.android.application.gradle.plugin:7.3.0 > com.android.tools.build:gradle:7.3.0 > androidx.databinding:databinding-compiler-common:7.3.0
   > Could not resolve com.android.databinding:baseLibrary:7.3.0.
      > Could not get resource 'https://dl.google.com/dl/android/maven2/com/android/databinding/baseLibrary/7.3.0/baseLibrary-7.3.0.pom'.
         > Could not GET 'https://dl.google.com/dl/android/maven2/com/android/databinding/baseLibrary/7.3.0/baseLibrary-7.3.0.pom'.
            > The server may not support the client's requested TLS protocol versions: (TLSv1.2, TLSv1.3). You may need to configure the client to allow other protocols to be used. See: https://docs.gradle.org/7.5/userguide/build_environment.html#gradle_system_properties
               > Remote host terminated the handshake
> Could not resolve com.android.tools.utp:android-device-provider-ddmlib-proto:30.3.0.
  Required by:
      unspecified:unspecified:unspecified > com.android.application:com.android.application.gradle.plugin:7.3.0 > com.android.tools.build:gradle:7.3.0
   > Could not resolve com.android.tools.utp:android-device-provider-ddmlib-proto:30.3.0.
      > Could not get resource 'https://dl.google.com/dl/android/maven2/com/android/tools/utp/android-device-provider-ddmlib-proto/30.3.0/android-device-provider-ddmlib-proto-30.3.0.pom'.
         > Could not GET 'https://dl.google.com/dl/android/maven2/com/android/tools/utp/android-device-provider-ddmlib-proto/30.3.0/android-device-provider-ddmlib-proto-30.3.0.pom'.
            > The server may not support the client's requested TLS protocol versions: (TLSv1.2, TLSv1.3). You may need to configure the client to allow other protocols to be used. See: https://docs.gradle.org/7.5/userguide/build_environment.html#gradle_system_properties
               > Remote host terminated the handshake
> Could not resolve com.android.tools.utp:android-test-plugin-host-additional-test-output-proto:30.3.0.
  Required by:
      unspecified:unspecified:unspecified > com.android.application:com.android.application.gradle.plugin:7.3.0 > com.android.tools.build:gradle:7.3.0
   > Could not resolve com.android.tools.utp:android-test-plugin-host-additional-test-output-proto:30.3.0.
      > Could not get resource 'https://dl.google.com/dl/android/maven2/com/android/tools/utp/android-test-plugin-host-additional-test-output-proto/30.3.0/android-test-plugin-host-additional-test-output-proto-30.3.0.pom'.
         > Could not GET 'https://dl.google.com/dl/android/maven2/com/android/tools/utp/android-test-plugin-host-additional-test-output-proto/30.3.0/android-test-plugin-host-additional-test-output-proto-30.3.0.pom'.
            > The server may not support the client's requested TLS protocol versions: (TLSv1.2, TLSv1.3). You may need to configure the client to allow other protocols to be used. See: https://docs.gradle.org/7.5/userguide/build_environment.html#gradle_system_properties
               > Remote host terminated the handshake
> Could not resolve com.android.tools.utp:android-test-plugin-host-retention-proto:30.3.0.
  Required by:
      unspecified:unspecified:unspecified > com.android.application:com.android.application.gradle.plugin:7.3.0 > com.android.tools.build:gradle:7.3.0
   > Could not resolve com.android.tools.utp:android-test-plugin-host-retention-proto:30.3.0.
      > Could not get resource 'https://dl.google.com/dl/android/maven2/com/android/tools/utp/android-test-plugin-host-retention-proto/30.3.0/android-test-plugin-host-retention-proto-30.3.0.pom'.
         > Could not GET 'https://dl.google.com/dl/android/maven2/com/android/tools/utp/android-test-plugin-host-retention-proto/30.3.0/android-test-plugin-host-retention-proto-30.3.0.pom'.
            > The server may not support the client's requested TLS protocol versions: (TLSv1.2, TLSv1.3). You may need to configure the client to allow other protocols to be used. See: https://docs.gradle.org/7.5/userguide/build_environment.html#gradle_system_properties
               > Remote host terminated the handshake

* Try:
> Run with --stacktrace option to get the stack trace.
> Run with --info or --debug option to get more log output.
> Run with --scan to get full insights.

* Get more help at https://help.gradle.org

BUILD FAILED in 54s
4 actionable tasks: 4 executed
```

网络问题，先看一下java版本

```bash
java -version
```

```
openjdk version "17.0.10" 2024-01-16
OpenJDK Runtime Environment (build 17.0.10+7)
OpenJDK 64-Bit Server VM (build 17.0.10+7, mixed mode)
```

可以显式地配置Gradle使用TLS协议,在gradle.properties文件

```gradle.properties
systemProp.jdk.tls.client.protocols=TLSv1.2,TLSv1.3

```

这个时候`./gradlew clean`可以正常工作了，但是`./gradlew assembleDebug ` 不能正常工作

这个时候，我打开了Android studio, it words!
