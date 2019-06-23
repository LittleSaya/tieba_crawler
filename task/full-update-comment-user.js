const Comment = require('../model/comment');
const User = require('../model/user');

/**
 * 更新指定贴吧所有楼中楼的用户信息（目前仅更新用户昵称）
 * 
 * @param {number} forumId 贴吧ID
 */
module.exports = async function(forumId) {
  let dbPageSize = 50;
  let dbPageNo = 0;
  let finished = false;
  while (!finished) {
    let commentList = await Comment.findAll({
      where: {
        forumId: forumId
      },
      offset: dbPageNo * dbPageSize,
      limit: dbPageSize
    });
    ++dbPageNo;

    if (commentList.length === 0) {
      finished = true;
      break;
    }

    for (let comment of commentList) {
      // 从用户表中获取用户信息
      let user = await User.findOne({
        where: {
          userId: comment.get('authorId')
        }
      });

      // 使用用户表中的用户信息更新 comment 表中的作者信息
      comment.set('authorNickname', user.get('userNickname'));
      await comment.save();
    }
  }
}
