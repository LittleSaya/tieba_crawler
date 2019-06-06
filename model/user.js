const Sequelize = require('sequelize');
const Model = Sequelize.Model;

class User extends Model {}
User.init({
  userId: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    field: 'user_id'
  }
}, {
  modelName: 'User',
  tableName: 'user'
});
