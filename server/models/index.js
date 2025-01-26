const sequelize = require('../config/database');
const User = require('./user');
const Message = require('./message');

// 在这里定义模型之间的关联关系（如果有的话）
// User.hasMany(Post)
// Post.belongsTo(User)

// 同步所有模型到数据库
sequelize.sync({ alter: true }).then(() => {
    console.log('数据库模型同步完成');
}).catch(err => {
    console.error('数据库模型同步失败:', err);
});

module.exports = {
    sequelize,
    User,
    Message
}; 