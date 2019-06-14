const fullThreadList = require('../task/full-thread-list');
const sequelize = require('../sequelize-instance');

async function main() {
  let rows = await fullThreadList('腐姬', 0);

  console.log(rows);

  sequelize.close();
}

main();
