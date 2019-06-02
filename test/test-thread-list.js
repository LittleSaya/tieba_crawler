var threadListGetter = require('../getter/thread-list');

const fs = require('fs');
const util = require('util');

async function main() {

  var obj = await threadListGetter('腐姬', 1);

  fs.writeFile('out/test-thread-list.log', util.inspect(obj, false, Infinity), (err) => {
    if (err) {
      throw err;
    }
    console.log('请求结果已保存');
  });
}

main();
