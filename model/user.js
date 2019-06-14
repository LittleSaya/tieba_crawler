const Sequelize = require('sequelize');
const sequelize = require('../sequelize-instance');
const Model = Sequelize.Model;

class User extends Model {}
User.init({
  userId: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    field: 'user_id'
  },
  userName: {
    type: Sequelize.STRING(255),
    unique: 'UNI_USER_NAME',
    allowNull: false,
    field: 'user_name'
  },
  userNickname: {
    type: Sequelize.STRING(255),
    unique: true,
    allowNull: true,
    field: 'user_nickname'
  }
}, {
  sequelize,
  timestamps: false,
  modelName: 'User',
  tableName: 'user'
});

module.exports = User;
