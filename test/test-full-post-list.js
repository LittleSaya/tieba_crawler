const fullPostList = require('../task/full-post-list');
const sequelize = require('../sequelize-instance');

async function main() {
  let rows = await fullPostList(904938, 0);

  console.log(rows);

  sequelize.close();
}

main();
