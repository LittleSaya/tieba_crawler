const threadListDownloader = require('../downloader/thread-list');
const forumInfoValidator = require('../validator/forum-info');
const Forum = require('../model/forum');

/**
 * task 内部的代码都是同步的
 * 该 task 获取并保存某个贴吧的基本信息
 * @param {string} tieba
 * @returns {number} 返回 1
 * @throws {Error} 当下载失败时抛出异常，当解析失败时抛出异常，当数据库请求出错时抛出异常
 */
module.exports = async function(tieba) {
  let html = await threadListDownloader(tieba, 0);

  let forumInfo = forumInfoValidator(html);

  if (forumInfo == null) {
    // 解析失败
    throw Error('task/forum-info: forumInfo is not an object, typeof forumInfo = ' + typeof forumInfo);
  }

  let success = null;
  try {
    success = await Forum.upsert(forumInfo);
  } catch(err) {
    // 数据库请求出错
    throw Error('task/forum-info: upsert failed, err = ' + err + ', object = ' + JSON.stringify(forumInfo));
  }

  // if (!success) {
  //   // 数据库请求出错，但 sequelize 未抛出异常
  //   throw Error('task/forum-info: upsert failed, object = ' + JSON.stringify(forumInfo));
  // }

  return 1;
}
