const paramUtil = require('../util/param');
const Thread = require('../model/thread');
const Post = require('../model/post');
const postListDownloader = require('../downloader/post-list');
const postListValidator = require('../validator/post-list');
const TRUE = require('../constant').stringBoolean.TRUE;
const Op = require('sequelize').Op;
const User = require('../model/user');

/**
 * task 内部的代码都是同步的
 * 该 task 执行全量更新跟帖列表
 * 将目标贴吧所有范围内主题帖的所有跟帖全部存储进数据库中，如果跟帖已经存在的话，则使用下载下来的新跟帖替换原有数据库内的
 * 所有新跟帖的 childrenOutOfDate 都为 TRUE
 * @param {number} forumId
 * @param {number} dbPageNo 数据库内的分页，从0开始
 * @param {number=0} [lastThreadId=0] 主题帖ID下限（只更新大于lastThreadId的主题帖的更贴）
 * 
 * @typedef {object} Ret
 * @property {number} cnt 获取的数据数量，值为 0 时表示该页无数据或数据无效
 * @property {number} data 本次执行涉及的最大 threadId
 * @returns {Ret}
 * 
 * @throws {Error} 当下载失败时抛出异常，当解析失败时抛出异常，当数据库请求出错时抛出异常
 */
module.exports = async function(forumId, dbPageNo, lastThreadId) {
  if (!paramUtil.isNumber(lastThreadId) || lastThreadId < 0) {
    lastThreadId = 0;
  }

  // 数据库分页大小
  let dbPageSize = 10;

  let threadList = null;
  try {
    threadList = await Thread.findAll({
      where: {
        [Op.and]: [
          {
            forumId: {
              [Op.eq]: forumId
            }
          },
          {
            threadId: {
              [Op.gte]: lastThreadId
            }
          }
        ]
      },
      offset: dbPageNo * dbPageSize,
      limit: dbPageSize,
      order: [
        [ 'threadId', 'ASC' ]
      ]
    });
  } catch (err) {
    // 获取主题帖列表时发生异常
    throw Error(`task/full-post-list: Thread.findAll failed, err = ${err}, forumId = ${forumId}, dbPageNo = ${dbPageNo}, dbPageSize = ${dbPageSize}`);
  }

  // 统计一共插入了多少条新的 post
  let postCount = 0;
  let maxThreadId = -1;

  for (let thread of threadList) {
    let threadFinished = false;
    let postListPageNo = 0;

    // 获取最大的 threadId
    let threadId = thread.get('threadId');
    if (threadId > maxThreadId) {
      maxThreadId = threadId;
    }

    while (!threadFinished) {
      let html = await postListDownloader(threadId, postListPageNo);

      let postList = postListValidator(html);

      if (postList == null) {
        // 解析失败
        throw Error('task/full-post-list: postList is not an object, typeof postList = ' + typeof postList);
      }

      if (paramUtil.isEmpty(postList)) {
        // 如果跟帖列表为空，则结束该主题帖
        threadFinished = true;
        continue;
      }

      // 如果已经超过最后一页，则结束主题帖
      for (let i in postList) {
        if (postList[i].currentPageNo > postList[i].lastPageNo) {
          threadFinished = true;
          break;
        }
      }
      if (threadFinished) {
        continue;
      }

      for (let i in postList) {
        let post = postList[i];

        post.childrenOutOfDate = TRUE;
        try {
          await Post.upsert(post);
        } catch (err) {
          // 数据库请求出错
          throw Error('task/full-post-list: Post.upsert failed, err = ' + err + ', object = ' + JSON.stringify(post));
        }

        // 更新用户数据
        let user = {
          userId: post.authorId,
          userName: post.authorName,
          userNickname: post.authorNickname
        };
        try {
          await User.upsert(user);
        } catch (err) {
          // 数据库请求出错
          throw Error('task/full-post-list: User.upsert failed, err = ' + err + ', object = ' + JSON.stringify(user));
        }
        
        ++postCount;
      }

      ++postListPageNo;
    }
  }

  return {
    cnt: postCount,
    data: maxThreadId
  };
}
