const paramUtil = require('../util/param');
const Post = require('../model/post');
const Op = require('sequelize').Op;
const commentListDownloader = require('../downloader/comment-list');
const commentListValidator = require('../validator/comment-list');
const userPageDownloader = require('../downloader/user-page');
const userPageValidator = require('../validator/user-page');
const Comment = require('../model/comment');
const User = require('../model/user');
const logger = require('../util/logger');

/**
 * task 内部的代码都是同步的
 * 该 task 执行全量更新楼中楼列表
 * 将目标贴吧所有范围内跟帖的所有楼中楼全部存储进数据库中，如果楼中楼已经存在的话，则使用下载下来的新楼中楼替换原有数据库内的
 * @param {number} forumId
 * @param {number} dbPageNo 数据库内跟贴列表的分页页码，从0开始
 * @param {number=0} [lastPostId=0] 跟帖ID下限（只更新大于lastPostId的跟帖的楼中楼）
 * 
 * @typedef {object} Ret
 * @property {number} cnt 获取的数据数量，值为 0 时表示该页无数据或数据无效
 * @property {number} data 本次执行涉及的最大 postId
 * @property {boolean} isFinished 是否需要更多 task 来完成更新， true 为不需要， false 为需要
 * @returns {Ret}
 * 
 * @throws {Error} 当下载失败时抛出异常，当解析失败时抛出异常，当数据库请求出错时抛出异常
 */
module.exports = async function(forumId, dbPageNo, lastPostId) {
  if (!paramUtil.isNumber(lastPostId) || lastPostId < 0) {
    lastPostId = 0;
  }

  // 数据库分页大小
  let dbPageSize = 10;

  let postList = null;
  try {
    postList = await Post.findAll({
      where: {
        [Op.and]: [
          {
            forumId: {
              [Op.eq]: forumId
            }
          },
          {
            postId: {
              [Op.gte]: lastPostId
            }
          }
        ]
      },
      offset: dbPageNo * dbPageSize,
      limit: dbPageSize,
      order: [
        [ 'postId', 'ASC' ]
      ]
    });
  } catch (err) {
    // 获取跟帖列表时发生异常
    throw Error(`task/full-comment-list: Post.findAll failed, err = ${err}, forumId = ${forumId}, dbPageNo = ${dbPageNo}, dbPageSize = ${dbPageSize}`);
  }

  let commentCount = 0;
  let maxPostId = -1;

  for (let post of postList) {
    // 对每一个 post ，拿到它的 threadId 和 postId
    let threadId = post.get('threadId');
    let postId = post.get('postId');

    // 获取最大的 postId
    if (postId > maxPostId) {
      maxPostId = postId;
    }

    logger.info('task/full-comment-list: threadId = ' + threadId + ', postId = ' + postId);

    let isPostFinished = false;
    let commentPageNo = 0;
    while (!isPostFinished) {
      let html = await commentListDownloader(threadId, postId, commentPageNo);

      let commentList = commentListValidator(html);

      if (commentList == null) {
        // 楼中楼列表解析失败
        throw Error('task/full-comment-list: commentList is not an object, typeof commentList = ' + typeof commentList);
      }

      if (paramUtil.isEmpty(commentList)) {
        // 楼中楼可以通过列表大小是否为零来判断是否抵达最后一页
        isPostFinished = true;
        continue;
      }

      for (let i in commentList) {
        // 填充楼中楼的 threadId 、 forumId、 postId 和用户信息
        let comment = commentList[i];
        comment.threadId = threadId;
        comment.postId = postId
        comment.forumId = forumId;

        let userPageHtml = await userPageDownloader(comment.authorName);

        let userInfo = userPageValidator(userPageHtml);

        if (userInfo == null) {
          // 用户信息解析错误
          throw Error('task/full-comment-list: userInfo is not an object, typeof userInfo = ' + typeof userInfo);
        }

        comment.authorId = userInfo.userId;

        // 保存
        try {
          await Comment.upsert(comment);
        } catch (err) {
          // 数据库请求出错
          throw Error('task/full-comment-list: Comment.upsert failed, err = ' + err + ', object = ' + JSON.stringify(comment));
        }

        // 更新用户数据
        let user = {
          userId: comment.authorId,
          userName: comment.authorName,
        };
        try {
          // 楼中楼暂时无法获取用户的昵称
          await User.upsert(user, {
            fields: ['userId', 'userName']
          });
        } catch (err) {
          // 数据库请求出错
          throw Error('task/full-comment-list: User.upsert failed, err = ' + err + ', object = ' + JSON.stringify(user));
        }
        
        ++commentCount;
      }

      ++commentPageNo;
    }
  }

  return {
    cnt: commentCount,
    data: maxPostId,
    isFinished: postList.length < dbPageSize
  };
}
