const get = require('../util/get');
const paramUtil = require('../util/param');

/**
 * 对 get.js 的封装，用于获取主题帖列表
 * @param {string} tieba 贴吧名称
 * @param {number} pageNo 页码（从 0 开始）
 * @returns {object} 直接返回 get.js 的返回值
 * @throws {Error} 当参数错误时抛出异常，当请求失败时抛出异常
 */
module.exports = async function(tieba, pageNo) {
  // 检查参数正确性
  if (!paramUtil.isString(tieba) || tieba.length === 0) {
    throw new Error('downloader/thread-list: param \'tieba\' got wrong value:' + tieba);
  }
  if (!paramUtil.isInt(pageNo) || pageNo < 0) {
    throw new Error('downloader/thread-list: param \'pageNo\' got wrong value:' + pageNo);
  }

  // 构造请求参数
  let params = {
    'ie': 'utf-8',
    'kw': tieba
  };

  if (pageNo !== 0) {
    params['pn'] = 50 * pageNo;
  }

  // 执行请求
  return await get('https://tieba.baidu.com/f', params);
}
