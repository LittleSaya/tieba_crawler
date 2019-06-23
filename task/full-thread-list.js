const threadListDownloader = require('../downloader/thread-list');
const threadListValidator = require('../validator/thread-list');
const paramUtil = require('../util/param');
const Thread = require('../model/thread');
const TRUE = require('../constant').stringBoolean.TRUE;
const User = require('../model/user');

/**
 * task 内部的代码都是同步的
 * 该 task 执行全量更新主题帖列表，同时对用户数据进行更新
 * 1. 将目标贴吧某页的主题帖全部存储进数据库中，如果主题帖已经存在的话，则使用下载下来的新主题帖替换原有数据库内的
 * 2. 对每一个主题帖，都会使用其作者的用户信息更新用户数据
 * 所有新主题贴的 childrenOutOfDate 都为 TRUE
 * @param {string} tieba
 * @param {number} pageNo
 * 
 * @typedef {object} Ret
 * @property {number} cnt 获取的数据数量，值为 0 时表示该页无数据或数据无效
 * @property {undefined} data
 * @returns {Ret}
 * 
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

    // 如果当前页大于尾页或没有当前页，则直接退出
    if (!paramUtil.isNumber(thread.currentPageNo) || pageNo > thread.lastPageNo) {
      break;
    }

    thread.childrenOutOfDate = TRUE;
    try {
      await Thread.upsert(thread);
    } catch (err) {
      // 数据库请求出错
      throw Error('task/full-thread-list: Thread.upsert failed, err = ' + err + ', object = ' + JSON.stringify(thread));
    }

    // 更新用户数据
    let user = {
      userId: thread.authorId,
      userName: thread.authorName,
      userNickname: thread.authorNickname
    };
    try {
      await User.upsert(user);
    } catch (err) {
      // 数据库请求出错
      throw Error('task/full-thread-list: User.upsert failed, err = ' + err + ', object = ' + JSON.stringify(user));
    }

    ++count;
  }

  return {
    cnt: count
  };
}
