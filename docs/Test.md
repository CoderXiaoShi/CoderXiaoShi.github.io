---
lang: zh-CN
title: VuePress 初体验
description: 页面的描述
date: yyyy-MM-dd

---

# VuePress 初体验

## 支持自定义组件

<HelloWorld />

<!-- 相对路径 -->

## URL

[首页](../README.md)  
[配置参考](../reference/config.md)  
[快速上手](./getting-started.md)

<!-- 绝对路径 -->

[指南 > 介绍](/zh/guide/introduction.md)  
[配置参考 > markdown.links](/zh/reference/config.md#links)

<!-- URL -->

[GitHub](https://github.com)

## Emoji 表情

VuePress 2 已经发布 :tada: ！

## 高亮特定行 

```ts{1,7-9}
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  title: '你好， VuePress',

  theme: defaultTheme({
    logo: 'https://vuejs.org/images/logo.png',
  }),
})
```
## 模板语法

一加一等于： {{ 1 + 1 }}

<span v-for="i in 3"> span: {{ i }} </span>

## 内置组件

这是默认主题内置的 `<Badge />` 组件 <Badge text="演示" />