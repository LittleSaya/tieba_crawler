const get = require('../util/get');
const paramUtil = require('../util/param');

/**
 * 对 get.js 的封装，用于获取楼中楼列表
 * @param {string} userName 用户名
 * @returns {object} 直接返回 get.js 的返回值
 * @throws {Error} 当参数错误时抛出异常，当请求失败时抛出异常
 */
module.exports = async function(userName) {
  // 检查参数正确性
  if (!paramUtil.isString(userName) || userName.length === 0) {
    throw new Error('downloader/user-page: param \'userName\' got wrong value:' + userName);
  }

  // 构造请求参数
  let params = {
    'un': userName
  };

  // 执行请求
  return await get('http://tieba.baidu.com/home/main', params);
}
