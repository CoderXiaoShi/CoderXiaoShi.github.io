const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
const users = require('./routes/users')
const messages = require('./routes/message')
const jwt = require('jsonwebtoken');


// 引入数据库配置
const db = require('./config/database');

// 引入数据库模型
require('./models');

// error handler
onerror(app)

// app.use(async (ctx, next) => {
//     const token = ctx.headers.authorization;

//     console.log('ctx.url:', ctx.url);
//     // ctx.url
//     let urls = [
//         { url: '/users/login', method: 'POST' },
//     ]

//     let isMatch = false;
//     for (let item of urls) {
//         if (item.url === ctx.url && item.method === ctx.method) {
//             isMatch = true;
//             break;
//         }
//     }

//     if (isMatch) {
//         await next();
//         return;
//     }

//     if (!token) {
//         ctx.status = 401;
//         ctx.body = { message: 'No token provided' };
//         return;
//     }

//     try {
//         // 验证 Token
//         const decoded = jwt.verify(token, SECRET_KEY);
//         if (decoded) {
//             await next();
//         } else {
//             throw new Error('Invalid token');
//         }
//         // ctx.body = { message: 'You are authenticated', user: decoded };
//     } catch (err) {
//         ctx.status = 401;
//         ctx.body = { message: 'Invalid token' };
//     }

// });

app.use(async (ctx, next) => {
    const allowedOrigins = [
        'http://localhost:8080',
        'http://localhost:3000',
        'https://www.xinglong.tech',
        'https://xinglong.tech',
        // 添加你的生产环境域名
        // 'https://your-domain.com'
    ];

    const origin = ctx.get('Origin');

    // 验证origin是否在允许列表中
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        ctx.set('Access-Control-Allow-Origin', origin);
        ctx.set('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST, DELETE');
        ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        ctx.set('Access-Control-Max-Age', '3600');
        // ctx.set('Access-Control-Allow-Credentials', 'true');
    }

    if (ctx.method === 'OPTIONS') {
        ctx.status = 200;
    } else {
        await next();
    }
});

// middlewares
app.use(bodyparser({
    enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
    extension: 'pug'
}))

console.log(process.env.NODE_ENV);

// logger
app.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(messages.routes(), messages.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

module.exports = app
