const Sequelize = require('sequelize');
const sequelize = require('../sequelize-instance');
const Model = Sequelize.Model;

class Thread extends Model {}
Thread.init({
  threadId: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    field: 'thread_id',
    comment: '主题帖ID'
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
    comment: '作者的昵称'
  },
  threadTitle: {
    type: Sequelize.STRING(255),
    allowNull: false,
    field: 'thread_title',
    comment: '主题帖标题'
  },
  createTime: {
    type: Sequelize.STRING(255),
    allowNull: false,
    field: 'create_time',
    comment: '创建时间'
  },
  lastReplyTime: {
    type: Sequelize.STRING(255),
    allowNull: true,
    field: 'last_reply_time',
    comment: '最后回复时间'
  },
  lastReplier: {
    type: Sequelize.STRING(255),
    allowNull: true,
    field: 'last_replier',
    comment: '最后回复人'
  },
  replyNum: {
    type: Sequelize.BIGINT,
    allowNull: false,
    field: 'reply_num',
    comment: '回复数量'
  },
  childrenOutOfDate: {
    type: Sequelize.STRING(1),
    allowNull: false,
    field: 'children_out_of_date',
    comment: '该主题帖的跟帖或楼中楼已过时'
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
  modelName: 'Thread',
  tableName: 'thread'
});

module.exports = Thread;
