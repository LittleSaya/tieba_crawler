const logger = require('../util/logger');

/**
 * user page validator
 * 验证某份文本是否是一个合法的用户主页
 * 如果验证通过，则返回用户信息，否则返回 null
 * @param {string} text 传入的文本参数
 * @returns {object}
 */
module.exports = function(text) {
  // 用户 ID
  let userId = null;

  // 正则表达式
  let regUserId = /data\-user\-id="(\d+)"/i;

  if (regUserId.test(text)) {
    userId = parseInt(RegExp.$1);
  }

  if (typeof userId != 'number') {
    // 如果出错，或者未能获取用户 ID ，则返回验证失败
    logger.info('validator/user-page: fail to get user_id');
    return null;
  }

  return {
    userId: userId
  };
}
