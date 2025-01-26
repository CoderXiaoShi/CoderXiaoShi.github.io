const Message = require('../models/message');
const router = require('koa-router')()
const multer = require('@koa/multer');
const path = require('path');
const fs = require('fs');


const upload = multer(); // note you can pass `multer` options here

router.prefix('/message')

// 图片上传接口
router.post('/uploadImage',
    upload.single('image'),
    async (ctx) => {
        console.log(ctx.request.file)
        const fileBuffer = ctx.request.file.buffer
        const fileName = ctx.request.file.originalname

        const filePath = path.join(process.cwd(), '../', 'docs', 'images', fileName)

        fs.writeFileSync(filePath, fileBuffer)

        // filePath

        const newMessage = await Message.create({
            role: 'user',
            message: `images/${fileName}`,
            type: 'image'
        });

        ctx.body = {
            code: 1,
            message: '上传成功',
            data: newMessage
        }
    }
);

// 创建消息
router.post('/', async (ctx) => {
    try {
        const { role, message, type } = ctx.request.body;
        console.log('create message', role, message, type);

        const newMessage = await Message.create({
            role,
            message,
            type
        });

        ctx.body = {
            code: 1,
            message: '创建成功',
            data: newMessage
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            code: 0,
            message: '创建失败',
            error: error.message
        };
    }
});

// 获取所有未删除的消息
router.get('/', async (ctx) => {
    try {
        const messages = await Message.findAll({
            where: {
                isDelete: 1
            },
            order: [['createdAt', 'ASC']]
        });
        ctx.body = {
            code: 1,
            message: '获取成功',
            total: messages.length,
            data: messages
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            code: 0,
            message: '获取失败',
            error: error.message
        };
    }
});

// 获取单个消息
router.get('/:id', async (ctx) => {
    try {
        const message = await Message.findOne({
            where: {
                id: ctx.params.id,
                isDelete: 1
            }
        });

        if (!message) {
            ctx.status = 404;
            ctx.body = {
                code: 0,
                message: '消息不存在'
            };
            return;
        }

        ctx.body = {
            code: 1,
            message: '获取成功',
            data: message
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            code: 0,
            message: '获取失败',
            error: error.message
        };
    }
});

// 更新消息
router.put('/:id', async (ctx) => {
    try {
        const { role, message, type } = ctx.request.body;
        const updatedMessage = await Message.update(
            { role, message, type },
            {
                where: {
                    id: ctx.params.id,
                    isDelete: 1
                }
            }
        );

        if (updatedMessage[0] === 0) {
            ctx.status = 404;
            ctx.body = {
                code: 0,
                message: '消息不存在'
            };
            return;
        }

        ctx.body = {
            code: 1,
            message: '更新成功'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            code: 0,
            message: '更新失败',
            error: error.message
        };
    }
});

// 逻辑删除消息
router.delete('/:id', async (ctx) => {
    try {
        const result = await Message.update(
            { isDelete: 0 },
            {
                where: {
                    id: ctx.params.id,
                    isDelete: 1
                }
            }
        );

        if (result[0] === 0) {
            ctx.status = 404;
            ctx.body = {
                code: 0,
                message: '消息不存在'
            };
            return;
        }

        ctx.body = {
            code: 1,
            message: '删除成功'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            code: 0,
            message: '删除失败',
            error: error.message
        };
    }
});

module.exports = router; 