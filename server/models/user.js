const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { md5 } = require('../utils/crypto');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
            // 在设置密码时自动进行MD5加密
            this.setDataValue('password', md5(value));
        }
    }
}, {
    tableName: 'users',
    timestamps: true
});

module.exports = User; 