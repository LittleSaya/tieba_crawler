var get = require('../util/get');
var validator = require('../validator/comment-list');
var paramUtil = require('../util/param');

var userPageGetter = require('../getter/user-page');

/**
 * 对 get.js 的封装，用于获取楼中楼列表
 * @param {number} threadId 主题帖 ID
 * @param {number} postId 跟帖 ID
 * @param {number} pageNo 页码（从 0 开始）
 * @returns {object} 直接返回 get.js 的返回值
 */
module.exports = async function(threadId, postId, pageNo) {
  // 检查参数正确性
  if (!paramUtil.isInt(threadId) || threadId < 0) {
    throw new Error('param \'threadId\' got wrong value:' + threadId);
  }
  if (!paramUtil.isInt(postId) || postId < 0) {
    throw new Error('param \'postId\' got wrong value:' + postId);
  }
  if (!paramUtil.isInt(pageNo) || pageNo < 0) {
    throw new Error('param \'pageNo\' got wrong value:' + pageNo);
  }

  // 构造请求参数
  var params = {
    'tid': threadId,
    'pid': postId,
    'pn': pageNo + 1
  };

  // 执行请求
  var commentList = await get('https://tieba.baidu.com/p/comment', params, validator);

  // 给每一个 comment 都加上主题帖 ID 和跟帖 ID
  for (let i in commentList.commentList) {
    commentList.commentList[i].thread_id = threadId;
    commentList.commentList[i].post_id = postId;
  }

  // 补全用户信息
  // 用户缓存
  var userCache = {};

  for (let i in commentList.commentList) {
    let userName = commentList.commentList[i].author_name;

    if (userCache[userName]) {
      // 如果用户名在缓存内，则直接使用缓存中的值
      commentList.commentList[i].author_id = userCache[userName];
    } else {
      // 如果用户名不在缓存内，则调用 getter 获取用户 ID
      try {
        let userId = await userPageGetter(userName);
        userCache[userName] = userId;
        commentList.commentList[i].author_id = userCache[userName];
      } catch (err) {
        console.log(err);
        throw new Error(`getter/comment-list: fail to get userId of userName '${userName}' when getting comment`)
      }
    }
  }

  return commentList;
}
