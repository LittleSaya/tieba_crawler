const config = require('../config').command;
const constant = require('../constant').command;

var paramUtil = require('../util/param');
var sqlUtil = require('../util/sql');

const fs = require('fs');

var postListGetter = require('../getter/post-list');
var commentListGetter = require('../getter/comment-list');

/**
 * 当 target_name 为 thread 时，执行该模块
 * @param {object} argv 命令行参数
 */
module.exports = async function(argv) {
  var threadId = null,
      postListPageStart = null,
      postListPageEnd = null,
      commentListPageStart = null,
      commentListPageEnd = null,
      outputTarget = null;
  
  // 处理参数
  // 主题帖 ID
  if (!argv[constant.name.threadId]) {
    console.log('\'thread_id\' not found in cmd params');
    return;
  } else if (!paramUtil.isInt(argv[constant.name.threadId]) || parseInt(argv[constant.name.threadId]) < 0) {
    console.log('invalid \'thread_id\' = ' + argv[constant.name.threadId]);
    return;
  } else {
    threadId = parseInt(argv[constant.name.threadId]);
  }

  // 跟帖列表开始页
  if (argv[constant.name.postListPageStart]) {
    try {
      postListPageStart = new Number(argv[constant.name.postListPageStart]);
    } catch (err) { }
  }
  if (!postListPageStart) {
    postListPageStart = config.postListPageStart;
  }

  // 跟帖列表结束页
  if (argv[constant.name.postListPageEnd]) {
    try {
      postListPageEnd = new Number(argv[constant.name.postListPageEnd]);
    } catch (err) { }
  }
  if (!postListPageEnd) {
    postListPageEnd = config.postListPageEnd;
  }

  // 楼中楼列表开始页
  if (argv[constant.name.commentListPageStart]) {
    try {
      commentListPageStart = new Number(argv[constant.name.commentListPageStart]);
    } catch (err) { }
  }
  if (!commentListPageStart) {
    commentListPageStart = config.commentListPageStart;
  }

  // 楼中楼列表结束页
  if (argv[constant.name.commentListPageEnd]) {
    try {
      commentListPageEnd = new Number(argv[constant.name.commentListPageEnd]);
    } catch (err) { }
  }
  if (!commentListPageEnd) {
    commentListPageEnd = config.commentListPageEnd;
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

  console.log('target=' + constant.value.target.thread);
  console.log('postListPageStart=' + postListPageStart);
  console.log('postListPageEnd=' + postListPageEnd);
  console.log('commentListPageStart=' + commentListPageStart);
  console.log('commentListPageEnd=' + commentListPageEnd);
  console.log('outputTarget=' + outputTarget);

  // 分页爬取目标主题帖的跟帖列表
  for (var i = postListPageStart; i <= postListPageEnd; ++i) {
    try {
      var postList = await postListGetter(threadId, i);
      // 如果跟帖列表大小为 0 则跳出
      if (paramUtil.isEmptyObject(postList.postList)) {
        break;
      }

      switch (outputTarget) {
        case constant.value.outputTarget.console:
          // 输出至控制台
          console.log(JSON.stringify(postList));
          break;
        
        case constant.value.outputTarget.log:
          // 输出至日志
          fs.writeFile(`out/post-list-${threadId}-${i}.log`, JSON.stringify(postList), (err) => {
            if (err) {
              console.log('fail to save post list to log file');
              console.log(err);
            }
          });
          break;
        
        case constant.value.outputTarget.sql:
          // 输出至 sql 文件
          var sqlList = [];
          for (let i in postList.postList) {
            var post = postList.postList[i];
            sqlList.push(sqlUtil.post(post));
          }
          var file = sqlList.join('\r\n');
          fs.writeFile(`out/sql-post-list-${threadId}-${i}.sql`, file, (err) => {
            if (err) {
              console.log('fail to save post list to sql file');
              console.log(err);
            }
          });
          break;
        
        case constant.value.outputTarget.database:
          // 输出至数据库
          // TODO
          break;
      }

      // 获取每个跟帖的楼中楼
      for (let j in postList.postList) {
        // 获取跟帖的主题帖 ID 和跟帖 ID
        let post = postList.postList[j];
        let threadId = post.thread_id;
        let postId = post.post_id;

        for (let k = commentListPageStart; k <= commentListPageEnd; ++k) {
          try {
            let commentList = await commentListGetter(threadId, postId, k);
  
            if (paramUtil.isEmptyObject(commentList.commentList)) {
              // 如果获取的楼中楼列表为空，则停止读取该跟帖的楼中楼
              break;
            }
  
            switch (outputTarget) {
              case constant.value.outputTarget.console:
                // 输出至控制台
                console.log(JSON.stringify(commentList));
                break;
              
              case constant.value.outputTarget.log:
                // 输出至日志
                fs.writeFile(`out/comment-list-tid=${threadId}-pid=${postId}-${k}.log`, JSON.stringify(commentList), (err) => {
                  if (err) {
                    console.log('fail to save comment list to log file');
                    console.log(err);
                  }
                });
                break;
              
              case constant.value.outputTarget.sql:
                // 输出至 sql 文件
                var sqlList = [];
                for (let i in commentList.commentList) {
                  var comment = commentList.commentList[i];
                  sqlList.push(sqlUtil.comment(comment));
                }
                var file = sqlList.join('\r\n');
                fs.writeFile(`out/sql-comment-list-tid=${threadId}-pid=${postId}-${k}.sql`, file, (err) => {
                  if (err) {
                    console.log('fail to save comment list to sql file');
                    console.log(err);
                  }
                });
                break;
              
              case constant.value.outputTarget.database:
                // 输出至数据库
                // TODO
                break;
            }
          } catch (err) {
            console.log(`fail to get comment list, threadId=${threadId}, postId=${postId}, page=${k}`);
            throw err;
          }
        }
      }
    } catch (error) {
      console.log(`fail to get post list, threadId='${threadId}', page=${i}`);
      console.log(error);
    }
  }

  console.log('finish');
}