const router = require('koa-router')()
const { User } = require('../models')
const { md5 } = require('../utils/crypto')
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../const');

router.prefix('/users')

router.get('/', function (ctx, next) {
    ctx.body = 'this is a users response!'
})

router.get('/bar', function (ctx, next) {
    ctx.body = 'this is a users/bar response'
})

// 创建新用户
router.post('/create', async (ctx) => {
    try {
        const { username, email, password } = ctx.request.body;
        const findUser = await User.findOne({
            where: {
                username
            }
        })
        if (findUser) {
            ctx.status = 400;
            ctx.body = {
                error: '用户已存在'
            };
            return;
        }
        const user = await User.create({
            username,
            password
        });

        ctx.body = {
            message: '用户创建成功',
            userId: user.id
        };
    } catch (err) {
        console.error(err)
        ctx.status = 400;
        ctx.body = {
            error: err.message
        };
    }
});

// 获取所有用户
// router.get('/search', async (ctx) => {
//     try {
//         const users = await User.findAll({
//             attributes: ['id', 'username', 'email', 'createdAt']
//         });
//         ctx.body = users;
//     } catch (err) {
//         ctx.status = 400;
//         ctx.body = {
//             error: err.message
//         };
//     }
// });


// 用户登录
router.post('/login', async (ctx) => {
    try {
        const { email, password } = ctx.request.body

        const user = await User.findOne({
            where: {
                username
            },
            attributes: ['id', 'username', 'email']
        })

        if (!user || user.password === password) {
            ctx.status = 401
            ctx.body = {
                error: '账户或密码错误'
            }
            return
        }
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        ctx.body = {
            message: '登录成功',
            user,
            token
        }
    } catch (err) {
        ctx.status = 400
        ctx.body = {
            error: err.message
        }
    }
})

module.exports = router
