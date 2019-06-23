const forumInfoTask = require('./task/forum-info');
const fullThreadListTask = require('./task/full-thread-list');
const fullPostListTask = require('./task/full-post-list');
const fullCommentListTask = require('./task/full-comment-list');
const argvUtil = require('./util/argv');
const paramUtil = require('./util/param');
const logger = require('./util/logger');
const Forum = require('./model/forum');
const Thread = require('./model/thread');
const Post = require('./model/post');
const Comment = require('./model/comment');
const User = require('./model/user');
const UpdateLog = require('./model/update-log');
const updateType = require('./constant').updateType;
const FALSE = require('./constant').stringBoolean.FALSE;
const TRUE = require('./constant').stringBoolean.TRUE;
const fullUpdateThreadTimeTask = require('./task/full-update-thread-time');
const fullUpdateCommentUser = require('./task/full-update-comment-user');

async function main() {
  let argv = argvUtil(process.argv);
  if (!paramUtil.isString(argv.tieba)) {
    logger.info('full-update: param \'tieba\' must be specified');
    return;
  }

  let forumName = argv.tieba;

  // 新建一个更新日志
  logger.info('full-update: creating new update log');
  let updateLog = await UpdateLog.create({
    startTime: new Date().getTime(),
    endTime: null,
    forumName: forumName,
    updateType: updateType.full,
    threadPhasePageNo: 0,
    threadPhaseFinished: FALSE,
    postPhaseThreadId: 0,
    postPhaseFinished: FALSE,
    commentPhasePostId: 0,
    commentPhaseFinished: FALSE
  });

  // 获取贴吧信息
  logger.info('full-update: executing task: forum-info');
  await forumInfoTask(argv.tieba);
  let forum = await Forum.findOne({ where: { forumName: argv.tieba }});

  // 并发量
  let concurrencySize = 10;
  
  // 主题帖列表全量更新
  logger.info('full-update: executing task: full-thread-list');
  let threadListPageNo = 0;
  let threadListFinished = false;
  while (!threadListFinished) {
    let tasks = [];
    for (let i = 0; i < concurrencySize; ++i) {
      tasks.push(fullThreadListTask(forum.get('forumName'), threadListPageNo + i));
    }
    threadListPageNo += concurrencySize;
    let results = await Promise.all(tasks);

    logger.info('full-update: full-thread-list: concurrency finished, current page = ' + threadListPageNo);

    // 是否结束
    for (let result of results) {
      if (result.cnt == 0) {
        threadListFinished = true;
        logger.info('full-update: task full-thread-list finished');
      }
    }

    // 每个循环结尾更新日志
    updateLog.set('threadPhasePageNo', threadListPageNo);
    if (threadListFinished) {
      updateLog.set('threadPhaseFinished', TRUE);
    }
    updateLog.save();
  }

  // 跟帖列表全量更新
  logger.info('full-update: executing task: full-post-list');
  let threadListDbPageNo = 0;
  let postListFinished = false;
  while (!postListFinished) {
    let tasks = [];
    for (let i = 0; i < concurrencySize; ++i) {
      tasks.push(fullPostListTask(forum.get('forumId'), threadListDbPageNo + i));
    }
    threadListDbPageNo += concurrencySize;
    let results = await Promise.all(tasks);

    logger.info('full-update: full-post-list: concurrency finished, current page (db) = ' + threadListDbPageNo);

    // 记录最大的 threadId
    let maxThreadId = -1;
    for (let result of results) {
      if (result.data > maxThreadId) {
        maxThreadId = result.data;
      }

      if (result.cnt == 0) {
        postListFinished = true;
        logger.info('full-update: task full-post-list finished');
      }
    }

    // 每个循环结尾更新日志
    updateLog.set('postPhaseThreadId', maxThreadId);
    if (postListFinished) {
      updateLog.set('postPhaseFinished', TRUE);
    }
    updateLog.save();
  }

  // 楼中楼列表全量更新
  logger.info('full-update: exeuting task: full-comment-list');
  let postListDbPageNo = 0;
  let commentListFinished = false;
  while (!commentListFinished) {
    let tasks = [];
    for (let i = 0; i < concurrencySize; ++i) {
      tasks.push(fullCommentListTask(forum.get('forumId'), postListDbPageNo + i));
    }
    postListDbPageNo += concurrencySize;
    let results = await Promise.all(tasks);

    logger.info('full-update: full-comment-list: concurrency finished, current page (db) = ' + postListDbPageNo);

    // 记录最大的 postId ，并判断楼中楼是否已经更新完毕
    let maxPostId = -1;
    for (let result of results) {
      if (result.data > maxPostId) {
        maxPostId = result.data;
      }

      if (result.isFinished) {
        commentListFinished = true;
        logger.info('full-update: task full-comment-list finished');
      }
    }

    // 循环结尾更新日志
    updateLog.set('commentPhasePostId', maxPostId);
    if (commentListFinished) {
      updateLog.set('commentPhaseFinished', TRUE);
    }
    updateLog.save();
  }
  
  // 更新主题帖的创建时间和最后回复时间
  logger.info('full-update: executing task full-update-thread-time');
  await fullUpdateThreadTimeTask(forum.get('forumId'));

  // 补全楼中楼的用户昵称
  logger.info('full-update: executing task full-update-comment-user');
  await fullUpdateCommentUser(forum.get('forumId'));

  // 更新结束时间
  updateLog.set('endTime', new Date().getTime());
  updateLog.save();
}

main();
