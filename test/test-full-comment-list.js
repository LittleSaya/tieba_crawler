const fullCommentList = require('../task/full-comment-list');
const sequelize = require('../sequelize-instance');

async function main() {
  let rows = await fullCommentList(904938, 0);

  console.log(rows);

  sequelize.close();
}

main();
