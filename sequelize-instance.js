const Sequelize = require('sequelize');

const sequelize = new Sequelize('mini_tieba', 'root', 'L5JXQ,m@YpA*gzJ*', {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
