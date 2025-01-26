const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../database.sqlite'),
    logging: console.log,
    define: {
        timestamps: true, // 默认为每个模型添加 createdAt 和 updatedAt 字段
        underscored: true, // 使用下划线命名方式
    }
});

// 测试数据库连接
(async () => {
    try {
        await sequelize.authenticate();
        console.log('数据库连接成功');
    } catch (error) {
        console.error('数据库连接失败:', error);
    }
})();

module.exports = sequelize; 