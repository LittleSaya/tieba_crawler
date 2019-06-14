const get = require('../util/get');
const paramUtil = require('../util/param');

/**
 * 对 get.js 的封装，用于获取楼中楼列表
 * @param {number} threadId 主题帖 ID
 * @param {number} postId 跟帖 ID
 * @param {number} pageNo 页码（从 0 开始）
 * @returns {object} 直接返回 get.js 的返回值
 * @throws {Error} 当参数错误时抛出异常，当请求失败时抛出异常
 */
module.exports = async function(threadId, postId, pageNo) {
  // 检查参数正确性
  if (!paramUtil.isInt(threadId) || threadId < 0) {
    throw new Error('downloader/comment-list: param \'threadId\' got wrong value:' + threadId);
  }
  if (!paramUtil.isInt(postId) || postId < 0) {
    throw new Error('downloader/comment-list: param \'postId\' got wrong value:' + postId);
  }
  if (!paramUtil.isInt(pageNo) || pageNo < 0) {
    throw new Error('downloader/comment-list: param \'pageNo\' got wrong value:' + pageNo);
  }

  // 构造请求参数
  let params = {
    'tid': threadId,
    'pid': postId,
    'pn': pageNo + 1
  };

  // 执行请求
  let commentList = await get('https://tieba.baidu.com/p/comment', params);

  return commentList;
}
