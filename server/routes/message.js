const Message = require('../models/message');
const router = require('koa-router')()
const multer = require('@koa/multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');


const upload = multer(); // note you can pass `multer` options here

router.prefix('/message')

// 图片上传接口
router.post('/uploadImage',
    upload.single('image'),
    async (ctx) => {
        console.log(ctx.request.file);
        const fileBuffer = ctx.request.file.buffer;
        const fileName = Date.now() + '_' + ctx.request.file.originalname;
        const mimeType = ctx.request.file.mimetype;

        // 压缩图片
        let compressedBuffer = fileBuffer;
        let quality = 80; // 初始质量

        try {
            while (true) {
                let sharpInstance = sharp(fileBuffer)
                    .rotate() // 自动根据 EXIF 数据旋转图片

                // 根据不同的图片格式使用不同的压缩策略
                switch (mimeType) {
                    case 'image/jpeg':
                    case 'image/jpg':
                        sharpInstance = sharpInstance.jpeg({ quality, mozjpeg: true });
                        break;
                    case 'image/png':
                        sharpInstance = sharpInstance.png({
                            quality,
                            compressionLevel: 9 // PNG 特有的压缩级别 (0-9)
                        });
                        break;
                    case 'image/webp':
                        sharpInstance = sharpInstance.webp({ quality });
                        break;
                    case 'image/gif':
                        // GIF 保持原格式，但可以减少颜色数量来压缩
                        sharpInstance = sharpInstance
                            .gif({
                                colours: Math.min(256, Math.max(2, Math.floor(256 * (quality / 100))))
                            });
                        break;
                    default:
                        // 默认转换为 JPEG
                        sharpInstance = sharpInstance.jpeg({ quality });
                }

                // 调整图片尺寸，如果图片太大的话
                if (quality < 50) {
                    sharpInstance = sharpInstance.resize(1200, 1200, {
                        fit: 'inside',
                        withoutEnlargement: true
                    });
                }

                compressedBuffer = await sharpInstance.toBuffer();

                // 检查压缩后的大小是否小于 500KB
                if (compressedBuffer.length <= 500 * 1024 || quality <= 10) {
                    break;
                }

                quality -= 10; // 如果还是太大，降低质量继续压缩
            }

            const filePath = path.join(process.cwd(), '../', 'docs', 'images', fileName);
            fs.writeFileSync(filePath, compressedBuffer);

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
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                code: 0,
                message: '图片处理失败',
                error: error.message
            }
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