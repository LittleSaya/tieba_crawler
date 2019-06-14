const Sequelize = require('sequelize');
const sequelize = require('../sequelize-instance');
const Model = Sequelize.Model;

class UpdateLog extends Model {}
UpdateLog.init({
  logId: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    field: 'log_id',
    comment: '更新日志主键'
  },
  startTime: {
    type: Sequelize.BIGINT,
    allowNull: false,
    field: 'start_time',
    comment: '开始时间（unix时间戳）'
  },
  endTime: {
    type: Sequelize.BIGINT,
    allowNull: true,
    field: 'end_time',
    comment: '结束时间（unix时间戳）'
  },
  forumName: {
    type: Sequelize.STRING(255),
    allowNull: false,
    field: 'forum_name',
    comment: '贴吧名称'
  },
  updateType: {
    type: Sequelize.STRING(255),
    allowNull: false,
    field: 'update_type',
    comment: '更新方式'
  },
  threadPhasePageNo: {
    type: Sequelize.BIGINT,
    allowNull: false,
    field: 'thread_phase_page_no',
    comment: '主题帖阶段-主题帖列表页码'
  },
  threadPhaseFinished: {
    type: Sequelize.STRING(1),
    allowNull: false,
    field: 'thread_phase_finished',
    comment: '主题帖阶段是否完成'
  },
  postPhaseThreadId: {
    type: Sequelize.BIGINT,
    field: 'post_phase_thread_id',
    allowNull: false,
    comment: '跟帖阶段-主题帖ID'
  },
  postPhaseFinished: {
    type: Sequelize.STRING(1),
    allowNull: false,
    field: 'post_phase_finished',
    comment: '跟贴阶段是否完成'
  },
  commentPhasePostId: {
    type: Sequelize.BIGINT,
    field: 'comment_phase_post_id',
    allowNull: false,
    comment: '楼中楼阶段-跟帖ID'
  },
  commentPhaseFinished: {
    type: Sequelize.STRING(1),
    allowNull: false,
    field: 'comment_phase_finished',
    comment: '楼中楼阶段是否完成'
  }
}, {
  sequelize,
  timestamps: false,
  modelName: 'UpdateLog',
  tableName: 'update_log'
});

module.exports = UpdateLog;
