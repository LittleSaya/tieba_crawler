const Thread = require('../model/thread');
const Post = require('../model/post');
const Comment = require('../model/comment');
const dateUtil = require('../util/date');

/**
 * 全量更新某个贴吧的所有主题帖的发表时间和最后回复时间
 * 
 * @param {number} forumId 贴吧 ID
 */
module.exports = async function(forumId) {
  let dbPageSize = 50;
  let dbPageNo = 0;
  let finished = false;
  while (!finished) {
    // 获取主题帖列表
    let threadList = await Thread.findAll({
      where: {
        forumId: forumId
      },
      offset: dbPageNo * dbPageSize,
      limit: dbPageSize
    });
    ++dbPageNo;

    if (threadList.length === 0) {
      finished = true;
      break;
    }

    // 对每一个主题帖执行更新（发表时间和最后回复时间）
    for (let thread of threadList) {
      let threadId = thread.get('threadId');

      // 获取与该主题帖关联的，发表时间最早的跟帖
      let firstPost = await Post.findOne({
        where: {
          threadId: threadId
        },
        order: [
          ['postId', 'ASC']
        ]
      });
      // 该主题帖的创建时间
      let threadCreateTime = firstPost.get('createTime');
  
      // 获取与该主题帖关联的，发表时间最晚的跟帖
      let lastPost = await Post.findOne({
        where: {
          threadId: threadId
        },
        order: [
          ['postId', 'DESC']
        ]
      });
      let threadLastPostReplyTime = lastPost.get('createTime');
  
      // 获取与该主题贴关联的，发表时间最晚的楼中楼
      let lastComment = await Comment.findOne({
        where: {
          threadId: threadId
        },
        order: [
          ['commentId', 'DESC']
        ]
      });
      // 如果该主题帖内没有楼中楼，则将楼中楼的最后回复时间赋值为 null
      let threadLastCommentReplyTime = (lastComment ? lastComment.get('createTime') : null);

      // 该主题贴的最后回复时间
      let threadLastReplyTime = null;
      if (threadLastCommentReplyTime == null) {
        threadLastReplyTime = threadLastPostReplyTime;
      } else {
        threadLastReplyTime = (
          dateUtil.parseStr(threadLastPostReplyTime).getTime() > dateUtil.parseStr(threadLastCommentReplyTime).getTime() ?
          threadLastPostReplyTime : threadLastCommentReplyTime);
      }
      
      thread.set('createTime', threadCreateTime);
      thread.set('lastReplyTime', threadLastReplyTime);
      await thread.save();
    }
  }
}
