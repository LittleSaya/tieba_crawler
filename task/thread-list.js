const config = require('../config').command;
const constant = require('../constant').command;

var paramUtil = require('../util/param');
var sqlUtil = require('../util/sql');

const fs = require('fs');

var threadListGetter = require('../getter/thread-list');

/**
 * 当 target_name 为 thread_list 时，执行该模块
 * @param {object} argv 命令行参数
 */
module.exports = async function(argv) {
  var tieba = null,
      threadListPageStart = null,
      threadListPageEnd = null,
      outputTarget = null;
  
  // 处理参数
  // 贴吧
  if (!argv[constant.name.tieba]) {
    console.log('\'tieba\' not found in cmd params');
    return;
  } else {
    tieba = argv[constant.name.tieba];
  }

  // 主题帖列表开始页
  if (argv[constant.name.threadListPageStart]) {
    try {
      threadListPageStart = new Number(argv[constant.name.threadListPageStart]);
    } catch (err) { }
  }
  if (!threadListPageStart) {
    threadListPageStart = config.threadListPageStart;
  }

  // 主题帖列表结束页
  if (argv[constant.name.threadListPageEnd]) {
    try {
      threadListPageEnd = new Number(argv[constant.name.threadListPageEnd]);
    } catch (err) { }
  }
  if (!threadListPageEnd) {
    threadListPageEnd = config.threadListPageEnd;
  }

  // 输出目标
  switch (argv[constant.name.outputTarget]) {
    case constant.value.outputTarget.console:
    case constant.value.outputTarget.database:
    case constant.value.outputTarget.log:
    case constant.value.outputTarget.sql:
      outputTarget = argv[constant.name.outputTarget];
      break;
    default:
      outputTarget = config.outputTarget;
      break;
  }

  console.log('target=' + constant.value.target.threadList);
  console.log('tieba=' + tieba);
  console.log('threadListPageStart=' + threadListPageStart);
  console.log('threadListPageEnd=' + threadListPageEnd);
  console.log('outputTarget=' + outputTarget);

  // 分页爬取目标贴吧的主题帖列表
  for (var i = threadListPageStart; i <= threadListPageEnd; ++i) {
    try {
      var threadList = await threadListGetter(tieba, i);
      // 如果主题帖列表大小为 0 则跳出
      if (paramUtil.isEmptyObject(threadList.threadList)) {
        break;
      }

      switch (outputTarget) {
        case constant.value.outputTarget.console:
          // 输出至控制台
          console.log(JSON.stringify(threadList));
          break;
        
        case constant.value.outputTarget.log:
          // 输出至日志
          fs.writeFile(`out/thread-list-${tieba}-${i}.log`, JSON.stringify(threadList), (err) => {
            if (err) {
              console.log('fail to save thread to log file');
              console.log(err);
            }
          });
          break;
        
        case constant.value.outputTarget.sql:
          // 输出至 sql 文件
          var sqlList = [];
          for (let i in threadList.threadList) {
            var thread = threadList.threadList[i];
            sqlList.push(sqlUtil.thread(thread));
          }
          var file = sqlList.join('\r\n');
          fs.writeFile(`out/sql-thread-list-${tieba}-${i}.sql`, file, (err) => {
            if (err) {
              console.log('fail to save thread to sql file');
              console.log(err);
            }
          });
          break;
        
        case constant.value.outputTarget.database:
          // 输出至数据库
          // TODO
          break;
      }
    } catch (error) {
      console.log(`fail to get thread list, tieba='${tieba}', page=${i}`);
      console.log(error);
    }
  }

  console.log('finish');
}