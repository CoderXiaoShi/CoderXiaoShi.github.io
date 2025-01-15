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

## GitHub + jsDelivr（免费且稳定）
    - 开源免费
    - 最大单张支持 10Mb 以内
    - 全球CDN加速, 支持外链, 原图保存
    - 完全免费

    这个, jsDelivr 方案有点复杂

1. 必须有 github 仓库
2. 必须打 tag

只要把你的图片上传到 github 仓库, 就可以通过 jsDelivr 访问了.

```javaascriptt
https://cdn.jsdelivr.net/gh/用户名/仓库名@版本号/图片路径
```


<table>
    <tbody>
  <tr>
    <td style="width: 50%;">
        <a href="https://imgse.com/" target="_blank">路过图床: https://imgse.com/</a>
    </td>
    <td style="width: 50%;">
        GitHub + jsDelivr
    </td>
  </tr>
  <tr>
    <td style="width: 50%;">
    <img src="https://s21.ax1x.com/2025/01/15/pEFFmuR.jpg" alt="小兰花, 抖音反串网红" title="小兰花, 抖音反串网红"  />
    <p>
        小兰花, 抖音反串网红
    </p>
    </td>
    <td style="width: 50%;"><img src="https://cdn.jsdelivr.net/gh/CoderXiaoShi/CoderXiaoShi.github.io@0.0.1/docs/images/xiaolanhua.jpg" alt="小兰花, 抖音翻船网红"  />
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
    <td><img src="https://cdn.jsdelivr.net/gh/CoderXiaoShi/CoderXiaoShi.github.io@0.0.2/docs/images/yaandongp.jpg" alt="潘金莲的药, 燕东萍的笑"  />
        <p>潘金莲的药, 燕东萍的笑</p>
    </td>
  </tr>
  <tr>
    <td>
        <img src="https://s21.ax1x.com/2025/01/15/pEFFUbt.jpg" alt="2021年中旬, 在上海的某著名打卡点" />
        <p>2021年中旬, 在上海的某著名打卡点</p>
    </td>
    <td>
        <img src="https://cdn.jsdelivr.net/gh/CoderXiaoShi/CoderXiaoShi.github.io@0.0.1/docs/images/52690e529ffd951768ad505f5da38cf.jpg" alt="2021年中旬, 在上海的某著名打卡点" />
        <p>2021年中旬, 在上海的某著名打卡点</p>
    </td>
  </tr>
  <tr>
    <td>
        <img src="https://s21.ax1x.com/2025/01/15/pEFFNDI.jpg" alt="2021年中旬, 在上海的某著名打卡点" />
        <p>2021年中旬, 在上海的某著名打卡点</p>
    </td>
    <td>
        <img src="https://cdn.jsdelivr.net/gh/CoderXiaoShi/CoderXiaoShi.github.io@0.0.1/docs/images/b07b5dca9f5cf4518dab6bd094915b2.jpg" alt="2021年中旬, 在上海的某著名打卡点" />
        <p>2021年中旬, 在上海的某著名打卡点</p>
    </td>
  </tr>
  <tr>
    <td>
        <img src="https://s21.ax1x.com/2025/01/15/pEFFtKA.jpg" alt="我的猫: 钢蛋儿"  />
        <p>我的猫: 钢蛋儿</p>
    </td>
    <td>
        <img src="https://cdn.jsdelivr.net/gh/CoderXiaoShi/CoderXiaoShi.github.io@0.0.2/docs/images/c2d20b4c14fb269eb44f0fd9a86928e.jpg" alt="我的猫: 钢蛋儿"  />
        <p>我的猫: 钢蛋儿</p>
    </td>
  </tr>
</tbody>
</table>

