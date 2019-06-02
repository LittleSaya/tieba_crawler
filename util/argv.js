/**
 * 将 process.argv 中的参数处理成一个对象
 * @param {string[]} argv
 * @returns {obejct}
 */
module.exports = (argv) => {
  argv = argv.slice(2);
  var obj = {};
  for (arg of argv) {
    if (arg.includes('=')) {
      // 名-值对
      var arr = arg.split('=');
      obj[arr[0]] = arr[1];
    } else {
      // flag
      obj[arg] = true;
    }
  }
  return obj;
}
