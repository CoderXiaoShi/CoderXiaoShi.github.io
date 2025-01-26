const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('Messages', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // role: 'user', // user | assistant | me
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user'
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING, // 'text', // text | image | video | audio | link
        allowNull: false,
        defaultValue: 'text'
    },
    isDelete: {
        type: DataTypes.INTEGER, // 0 删除 1 正常
        defaultValue: 1,
        // type: DataTypes.INTEGER,
    },
}, {
    tableName: 'messages',
    timestamps: true
});

module.exports = User; 