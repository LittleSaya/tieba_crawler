const forumInfo = require('../task/forum-info');
const sequelize = require('../sequelize-instance');

async function main() {
  let rows = await forumInfo('腐姬');

  console.log(rows);

  sequelize.close();
}

main();
