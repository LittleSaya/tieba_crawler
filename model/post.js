const Sequelize = require('sequelize');
const sequelize = require('../sequelize-instance');
const Model = Sequelize.Model;

class Post extends Model {}
Post.init({
  postId: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    field: 'post_id',
    comment: '跟帖ID'
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
  postContent: {
    type: Sequelize.TEXT,
    allowNull: false,
    field: 'post_content',
    comment: '跟帖内容'
  },
  createTime: {
    type: Sequelize.STRING(255),
    allowNull: false,
    field: 'create_time',
    comment: '创建时间，格式：yyyy-mm-dd hh:mm'
  },
  postNo: {
    type: Sequelize.BIGINT,
    allowNull: false,
    field: 'post_no',
    comment: '跟帖楼层'
  },
  commentNum: {
    type: Sequelize.BIGINT,
    allowNull: false,
    field: 'comment_num',
    comment: '楼中楼回复数'
  },
  childrenOutOfDate: {
    type: Sequelize.STRING(1),
    allowNull: false,
    field: 'children_out_of_date',
    comment: '该跟帖的楼中楼已过时'
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
  modelName: 'Post',
  tableName: 'post'
});

module.exports = Post;
