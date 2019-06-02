var get = require('../util/get');
var validator = require('../validator/thread-list');
var paramUtil = require('../util/param');

/**
 * 对 get.js 的封装，用于获取主题帖列表
 * @param {string} tieba 贴吧名称
 * @param {number} pageNo 页码（从 0 开始）
 * @returns {object} 直接返回 get.js 的返回值
 */
module.exports = async function(tieba, pageNo) {
  // 检查参数正确性
  if (!paramUtil.isString(tieba) || tieba.length === 0) {
    throw new Error('param \'tieba\' got wrong value:' + tieba);
  }
  if (!paramUtil.isInt(pageNo) || pageNo < 0) {
    throw new Error('param \'pageNo\' got wrong value:' + pageNo);
  }

  // 构造请求参数
  var params = {
    'ie': 'utf-8',
    'kw': tieba
  };

  if (pageNo !== 0) {
    params['pn'] = (50 * pageNo).toString();
  }

  // 执行请求
  return await get('https://tieba.baidu.com/f', params, validator);
}