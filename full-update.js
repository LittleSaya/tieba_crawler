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

async function main() {
  let argv = argvUtil(process.argv);

  if (!paramUtil.isString(argv.tieba)) {
    logger.info('full-update: param \'tieba\' must be specified');
    return;
  }

  let forumName = argv.tieba;

  let result = null;

  logger.info('full-update: creating new update log');
  result = await UpdateLog.create({
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

  return;

  logger.info('full-update: executing task: forum-info');
  result = await forumInfoTask(argv.tieba);
}

main();
