const fs = require('fs');

/**
 * user page validator
 * 验证某份文本是否是一个合法的用户主页
 * 如果验证通过，则返回结果中的 isValid 为 true ，且 nextStage 为数字形式的用户 ID
 * @param {string} text 传入的文本参数
 * @returns {object} { isValid: boolean, nextStage: number }
 */
module.exports = function(text) {
  // 保存用户页面
  if (global.debug) {
    fs.writeFile('out/user-page.log', text, (err) => {
      if (err) {
        console.log('fail to save \'out/user-page.log\'');
      } else {
        console.log('\'out/user-page.log\' saved');
      }
    });
  }

  // 用户 ID
  var userId = null;

  // 正则表达式
  var regUserId = /data\-user\-id="(\d+)"/i;

  if (regUserId.test(text)) {
    userId = parseInt(RegExp.$1);
  }

  if (typeof userId != 'number') {
    // 如果出错，或者未能获取用户 ID ，则返回验证失败
    console.log('validator/user-page: fail to get user_id');
    return {
      isValid: false,
      nextStage: null
    };
  }

  return {
    isValid: true,
    nextStage: userId
  };
}
