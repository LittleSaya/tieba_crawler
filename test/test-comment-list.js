var commentListGetter = require('../getter/comment-list');

const fs = require('fs');
const util = require('util');

async function main() {

  var obj = await commentListGetter(6145094020, 125831798419, 0);

  fs.writeFile('out/test-comment-list.log', util.inspect(obj, false, Infinity), (err) => {
    if (err) {
      throw err;
    }
    console.log('请求结果已保存');
  });
}

main();
