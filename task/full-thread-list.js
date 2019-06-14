const threadListDownloader = require('../downloader/thread-list');
const threadListValidator = require('../validator/thread-list');
const paramUtil = require('../util/param');
const Thread = require('../model/thread');
const TRUE = require('../constant').stringBoolean.TRUE;

/**
 * task 内部的代码都是同步的
 * 该 task 执行全量更新主题帖列表
 * 将目标贴吧某页的主题帖全部存储进数据库中，如果主题帖已经存在的话，则使用下载下来的新主题帖替换原有数据库内的
 * 所有新主题贴的 childrenOutOfDate 都为 TRUE
 * @param {string} tieba
 * @param {number} pageNo
 * @returns {number} 返回更新的主题帖数量
 * @throws {Error} 当下载失败时抛出异常，当解析失败时抛出异常，当数据库请求出错时抛出异常
 */
module.exports = async function(tieba, pageNo) {
  let html = await threadListDownloader(tieba, pageNo);

  let threadList = threadListValidator(html);

  if (!paramUtil.isObject(threadList)) {
    // 解析失败
    throw Error('task/full-thread-list: threadList is not an object, typeof threadList = ' + typeof threadList);
  }

  let count = 0;
  for (let i in threadList) {
    let thread = threadList[i];
    thread.childrenOutOfDate = TRUE;
    let success = null;
    try {
      success = await Thread.upsert(thread);
    } catch (err) {
      // 数据库请求出错
      throw Error('task/full-thread-list: Thread.upsert failed, err = ' + err + ', object = ' + JSON.stringify(thread));
    }

    // if (success) {
    //   ++count;
    // } else {
    //   // 数据库请求出错，但 sequelize 未抛出异常
    //   throw Error('task/full-thread-list: Thread.upsert failed, object = ' + JSON.stringify(thread));
    // }
    ++count;
  }

  return count;
}
