import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
    base: '/',
    lang: 'zh-CN',
    title: '程序员小石',
    description: '我是程序员小石, 欢迎来到我的博客',

    bundler: viteBundler(),
    theme: defaultTheme({

        sidebar: {
            // '/guide/': [
            //     {
            //         text: '指南',
            //         children: [
            //             '/guide/installation.md',
            //             '/guide/usage.md'
            //         ]
            //     }
            // ],
            // '/': [
            //     {
            //         text: '高级',
            //         children: [
            //             '/guide/installation.md',
            //             '/Test.md'
            //         ]
            //     }
            // ]
        },
        // 默认主题配置
        navbar: [
            {
                text: '首页',
                link: '/',
            },
            {
                text: 'Links',
                link: '/Links.md',
            },
            {
                text: 'Github',
                link: 'https://github.com/CoderXiaoShi',
            },
            // {
            //     text: 'guide',
            //     link: '/guide/getting-started.md',
            //     children: [
            //         '/guide/installation.md',
            //         '/guide/usage.md'
            //     ]
            // },
        ],
    }),

    head: [['link', { rel: 'icon', href: '/images/favicon.ico' }]],
    open: false,

})
