var userPageGetter = require('../getter/user-page');

const fs = require('fs');
const util = require('util');

async function main() {

  var obj = await userPageGetter('传说的世纪');

  fs.writeFile('out/test-user-page.log', util.inspect(obj, false, Infinity), (err) => {
    if (err) {
      throw err;
    }
    console.log('请求结果已保存');
  });
}

main();
