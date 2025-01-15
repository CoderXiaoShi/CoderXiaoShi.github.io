---
lang: zh-CN
title: 两个图床速度比拼
description: 页面的描述
date: yyyy-MM-dd

---

# 两个图床速度比拼

```javascript
刚上线博客, 突发奇想
既然选择用到图床, 为何不搞一场比赛呢. 在一个页面中展示两个图床的加载速度.
```

下面先介绍一下, 我选择的两款图床.

## 路过图床
    - 国内图床
    - 最大单张支持 10 MB
    - 全球CDN加速, 支持外链, 原图保存
    - https://imgse.com/

## 聚合图床
    - 国外老牌图床
    - 最大单张支持: 应该是 10 Mb 以上
    - 全球CDN加速, 支持外链, 原图保存
    - x 必须翻墙
    - https://imgur.com/

<table>
    <tbody>
  <tr>
    <td style="width: 50%;">
        <a href="https://imgse.com/" target="_blank">路过图床: https://imgse.com/</a>
    </td>
    <td style="width: 50%;">
        <a href="https://imgur.com/" target="_blank">imgur: https://imgur.com/</a>
    </td>
  </tr>
  <tr>
    <td style="width: 50%;">
    <img src="https://s21.ax1x.com/2025/01/15/pEFFmuR.jpg" alt="小兰花, 抖音反串网红" title="小兰花, 抖音反串网红"  />
    <p>
        小兰花, 抖音反串网红
    </p>
    </td>
    <td style="width: 50%;"><img src="https://i.imgur.com/5gfpu6j.jpeg" alt="小兰花, 抖音翻船网红"  />
        <p>
        小兰花, 抖音反串网红
    </p>
    </td>
  </tr>
  <tr>
    <td>
        <img src="https://s21.ax1x.com/2025/01/15/pEFFJvd.jpg" alt="潘金莲的药, 燕东萍的笑"  />
        <p>潘金莲的药, 燕东萍的笑</p>
    </td>
    <td><img src="https://i.imgur.com/NTMVvYU.jpeg" alt="潘金莲的药, 燕东萍的笑"  />
        <p>潘金莲的药, 燕东萍的笑</p>
    </td>
  </tr>
  <tr>
    <td>
        <img src="https://s21.ax1x.com/2025/01/15/pEFFUbt.jpg" alt="2021年中旬, 在上海的某著名打卡点" />
        <p>2021年中旬, 在上海的某著名打卡点</p>
    </td>
    <td>
        <img src="https://i.imgur.com/N7VC7RJ.jpeg" alt="2021年中旬, 在上海的某著名打卡点" />
        <p>2021年中旬, 在上海的某著名打卡点</p>
    </td>
  </tr>
  <tr>
    <td>
        <img src="https://s21.ax1x.com/2025/01/15/pEFFNDI.jpg" alt="2021年中旬, 在上海的某著名打卡点" />
        <p>2021年中旬, 在上海的某著名打卡点</p>
    </td>
    <td>
        <img src="https://i.imgur.com/wkXX3OB.jpeg" alt="2021年中旬, 在上海的某著名打卡点" />
        <p>2021年中旬, 在上海的某著名打卡点</p>
    </td>
  </tr>
  <tr>
    <td>
        <img src="https://s21.ax1x.com/2025/01/15/pEFFtKA.jpg" alt="我的猫: 钢蛋儿"  />
        <p>我的猫: 钢蛋儿</p>
    </td>
    <td>
        <img src="https://i.imgur.com/oxw0s5t.jpeg" alt="我的猫: 钢蛋儿"  />
        <p>我的猫: 钢蛋儿</p>
    </td>
  </tr>
</tbody>
</table>


## 还有一个方案, jsDelivr 有空我试试


GitHub + jsDelivr（免费且稳定）
特点：

将图片上传到 GitHub 仓库，通过 jsDelivr CDN 加速访问。

完全免费，无存储和流量限制。

支持 HTTPS。

步骤：

在 GitHub 上创建一个仓库。

将图片上传到仓库。

使用 jsDelivr CDN 链接访问图片，例如：

复制
https://cdn.jsdelivr.net/gh/用户名/仓库名@版本号/图片路径
限制：

需要一定的技术能力。

GitHub 仓库公开，图片对所有人可见。

https://cdn.jsdelivr.net/gh/CoderXiaoShi/CoderXiaoShi.github.io/docs/images/logo.jpg

