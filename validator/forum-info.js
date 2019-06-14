const logger = require('../util/logger');

/**
 * forum info validator
 * 验证某份文本是否包含合法的贴吧信息
 * 如果验证通过，则返回包含贴吧信息的对象，否则返回 null
 * @param {string} text 传入的文本参数
 * @returns {object}
 */
module.exports = function(text) {
  // 获取贴吧 ID 和名称
  let forumId = null;
  let forumName = null;
  let regForumId = /PageData\.forum\s*=\s*\{\s*'id'\s*:\s*(\d+)\s*,\s*'name'\s*:\s*"(\S+)"/i;
  if (regForumId.test(text)) {
    forumId = RegExp.$1;

    // 将贴吧名称从字符串形式的 unicode 编码转换为真正的字符串
    forumName = RegExp.$2.replace(/\\u/g, ',');
    let codeList = forumName.split(',').slice(1);
    codeList.forEach((value, index, array) => {
      array[index] = parseInt(value, 16);
    })
    forumName = String.fromCharCode.apply(null, codeList);
    return {
      forumId: forumId,
      forumName: forumName
    };
  } else {
    // 未能找到贴吧 ID 和名称，验证失败
    logger.info('validator/forum-info: fail to find forum id and name');
    return null;
  }
}
