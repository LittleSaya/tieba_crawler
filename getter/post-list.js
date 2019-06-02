var get = require('../util/get');
var validator = require('../validator/post-list');
var paramUtil = require('../util/param');

/**
 * 对 get.js 的封装，用于获取跟帖列表
 * @param {number} threadId 主题帖 ID
 * @param {number} pageNo 页码（从 0 开始）
 * @returns {object} 直接返回 get.js 的返回值
 */
module.exports = async function(threadId, pageNo) {
  // 检查参数正确性
  if (!paramUtil.isInt(threadId) || threadId < 0) {
    throw new Error('param \'threadId\' got wrong value:' + threadId);
  }
  if (!paramUtil.isInt(pageNo) || pageNo < 0) {
    throw new Error('param \'pageNo\' got wrong value:' + pageNo);
  }

  // 构造 url
  var url = `https://tieba.baidu.com/p/${threadId}`;

  // 构造请求参数
  var params = {
    'pn': pageNo + 1
  };

  // 执行请求
  return await get(url, params, validator);
}
