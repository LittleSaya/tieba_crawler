const Sequelize = require('sequelize');
const sequelize = require('../sequelize-instance');
const Model = Sequelize.Model;

class Forum extends Model {}
Forum.init({
  forumId: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    field: 'forum_id'
  },
  forumName: {
    type: Sequelize.STRING(255),
    unique: true,
    allowNull: false,
    field: 'forum_name'
  }
}, {
  sequelize,
  timestamps: false,
  modelName: 'Forum',
  tableName: 'forum'
});

module.exports = Forum;
