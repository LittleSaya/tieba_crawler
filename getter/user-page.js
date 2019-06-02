var get = require('../util/get');
var validator = require('../validator/user-page');
var paramUtil = require('../util/param');

/**
 * 对 get.js 的封装，用于获取楼中楼列表
 * @param {string} userName 用户名
 * @returns {object} 直接返回 get.js 的返回值
 */
module.exports = async function(userName) {
  // 检查参数正确性
  if (!paramUtil.isString(userName) || userName.length === 0) {
    throw new Error('param \'userName\' got wrong value:' + userName);
  }

  // 构造请求参数
  var params = {
    'un': userName
  };

  // 执行请求
  return await get('http://tieba.baidu.com/home/main', params, validator);
}
