const threadListDownloader = require('../downloader/thread-list');
const forumInfoValidator = require('../validator/forum-info');
const Forum = require('../model/forum');

/**
 * task 内部的代码都是同步的
 * 该 task 获取并保存某个贴吧的基本信息
 * @param {string} tieba
 * 
 * @typedef {object} Ret
 * @property {number} cnt 获取的数据数量
 * @property {undefined} data
 * @returns {Ret}
 * 
 * @throws {Error} 当下载失败时抛出异常，当解析失败时抛出异常，当数据库请求出错时抛出异常
 */
module.exports = async function(tieba) {
  let html = await threadListDownloader(tieba, 0);

  let forumInfo = forumInfoValidator(html);

  if (forumInfo == null) {
    // 解析失败
    throw Error('task/forum-info: forumInfo is not an object, typeof forumInfo = ' + typeof forumInfo);
  }

  try {
    await Forum.upsert(forumInfo);
  } catch(err) {
    // 数据库请求出错
    throw Error('task/forum-info: upsert failed, err = ' + err + ', object = ' + JSON.stringify(forumInfo));
  }

  return {
    cnt: 1
  };
}
