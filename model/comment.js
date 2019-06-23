const Sequelize = require('sequelize');
const sequelize = require('../sequelize-instance');
const Model = Sequelize.Model;

class Comment extends Model {}
Comment.init({
  commentId: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    field: 'comment_id',
    comment: '楼中楼ID'
  },
  authorId: {
    type: Sequelize.BIGINT,
    allowNull: false,
    field: 'author_id',
    comment: '作者ID'
  },
  authorName: {
    type: Sequelize.STRING(255),
    allowNull: false,
    field: 'author_name',
    comment: '作者用户名'
  },
  authorNickname: {
    type: Sequelize.STRING(255),
    allowNull: true,
    field: 'author_nickname',
    comment: '作者昵称'
  },
  commentContent: {
    type: Sequelize.STRING(1023),
    allowNull: false,
    field: 'comment_content',
    comment: '楼中楼内容'
  },
  createTime: {
    type: Sequelize.STRING,
    allowNull: false,
    field: 'create_time',
    comment: '创建时间，格式：yyyy-mm-dd hh:mm'
  },
  seq: {
    type: Sequelize.BIGINT,
    allowNull: false,
    field: 'seq',
    comment: '序号（排序用，页码和页内顺序拼接）'
  },
  postId: {
    type: Sequelize.BIGINT,
    allowNull: false,
    field: 'post_id',
    comment: '跟帖ID'
  },
  threadId: {
    type: Sequelize.BIGINT,
    allowNull: false,
    field: 'thread_id',
    comment: '主题帖ID'
  },
  forumId: {
    type: Sequelize.BIGINT,
    allowNull: false,
    field: 'forum_id',
    comment: '贴吧ID'
  }
}, {
  sequelize,
  timestamps: false,
  modelName: 'Comment',
  tableName: 'comment'
});

module.exports = Comment;
