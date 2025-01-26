const crypto = require('crypto');

/**
 * MD5加密函数
 * @param {string} content - 需要加密的内容
 * @param {string} [salt=''] - 盐值，默认为空
 * @returns {string} - 返回加密后的字符串
 */
const md5 = (content, salt = '') => {
    return crypto
        .createHash('md5')
        .update(content + salt)
        .digest('hex');
};

module.exports = {
    md5
}; 