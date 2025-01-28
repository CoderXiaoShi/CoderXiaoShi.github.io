const router = require('koa-router')()
const { User } = require('../models');
const { md5 } = require('../utils/crypto')
const axios = require('axios')

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

router.get('/', async (ctx, next) => {
    await ctx.render('index', {
        title: 'Hello Koa 2!'
    })
})

router.get('/ryouok', async (ctx, next) => {
    ctx.body = 'ok'
})

router.get('/publish', async (ctx, next) => {

    /*
        1. 点击发布, 替换 messageData.json
        2. 编译
        3. 提交到 github
    */

    try {
        // 1. 点击发布, 替换 messageData.json
        const res = await axios.get('http://localhost:3000/message')
        console.log(res.data);
        let data = res.data
        fs.writeFileSync(path.resolve(__dirname, '../../docs/messageData.json'), JSON.stringify(data))

        console.log(`1. 写入 messageData.json 成功`)

        // 2. 编译
        execSync('npm run docs:build', {
            cwd: path.join(process.cwd(), '../')
        })

        console.log(`2. 编译成功`)

        // 3. 提交到 github
        execSync('git add .', {
            cwd: path.join(process.cwd(), '../')
        })
        execSync('git commit -m "publish"', {
            cwd: path.join(process.cwd(), '../')
        })
        execSync('git push', {
            cwd: path.join(process.cwd(), '../')
        })

        console.log(`3. 提交到 github 成功`)

        ctx.body = {
            message: 'publish ok',
            data,
        }
    } catch (error) {
        ctx.body = {
            message: 'publish error',
            error: error.message
        }
    }
    // await ctx.render('index', {
    //     title: 'Hello Koa 2!'
    // })
})

// 增删改查

router.get('/string', async (ctx, next) => {
    ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
    ctx.body = {
        title: 'koa2 json'
    }
})

module.exports = router
