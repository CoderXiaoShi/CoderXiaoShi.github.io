import fs from 'fs';
import path from 'path';

const myPlugin = () => ({
    name: 'vuepress-plugin-build',
    onGenerated() {
        const messageData = fs.readFileSync(path.resolve(__dirname, '../../messageData.json'), 'utf-8');

        fs.writeFileSync(path.resolve(process.cwd(), 'dist', 'messageData.json'), messageData);

        // 将 images 目录下的图片复制到 dist 目录下
        const imagesDir = path.resolve(process.cwd(), 'docs/images');
        const distImagesDir = path.resolve(process.cwd(), 'dist', 'images');

        // 确保目标目录存在
        if (!fs.existsSync(distImagesDir)) {
            fs.mkdirSync(distImagesDir, { recursive: true });
        }

        // 复制整个目录
        fs.cpSync(imagesDir, distImagesDir, { recursive: true });

        console.log('onGenerated');
    }
})

export default myPlugin;