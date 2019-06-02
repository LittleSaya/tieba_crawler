var postListGetter = require('../getter/post-list');

const fs = require('fs');
const util = require('util');

async function main() {

  var obj = await postListGetter(4930459021, 10);

  fs.writeFile('out/test-post-list.log', util.inspect(obj, false, Infinity), (err) => {
    if (err) {
      throw err;
    }
    console.log('请求结果已保存');
  });
}

main();
