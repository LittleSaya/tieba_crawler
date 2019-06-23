const htmlparser2 = require('htmlparser2');
const logger = require('../util/logger');
const parseDataField = require('../util/parse-data-field');
const forumInfoValidator = require('./forum-info');

/**
 * thread list validator
 * 验证某份文本是否是一个合法的主题帖的列表
 * 如果验证通过，则返回主题帖列表，否则返回 null
 * @param {string} text 传入的文本参数
 * @returns {object}
 */
module.exports = function(text) {
  let forumInfo = forumInfoValidator(text);
  if (!forumInfo) {
    logger('validator/thread-list: fail to find forum info');
    return null;
  }
  let forumId = forumInfo.forumId;

  // 一、对主题帖列表页面进行解析，获取文本格式的主题帖列表

  // 是否找到主题帖列表
  let isFoundThreadListText = false;
  // 是否已经获取主题帖列表
  let hasFoundThreadListText = false;
  // 在获取主题帖列表的过程中是否发生错误
  let isErrorThreadListText = false;
  // 主题帖列表的文本
  let threadListText = null;

  // 创建 outer parser ，用于寻找主题帖列表
  let outerParser = new htmlparser2.Parser({
    onopentag: (name, attribs) => {
      if (name == 'code' && attribs.id && attribs.id.trim() == 'pagelet_html_frs-list/pagelet/thread_list') {
        // 找到了符合要求的code节点
        // 主题帖列表以注释的形式存在于该节点内
        isFoundThreadListText = true;
      }
    },
    oncomment: (data) => {
      if (isFoundThreadListText && !hasFoundThreadListText) {
        // 如果找到了符合要求的code节点，则下一个comment就是主题帖列表
        threadListText = data;
        hasFoundThreadListText = true;
      }
    },
    onerror: (error) => {
      logger.info('validator/thread-list: parser on error: ' + error);
      isErrorThreadListText = true;
    }
  });

  // 解析
  outerParser.write(text);
  outerParser.end();

  if (threadListText == null || isErrorThreadListText) {
    // 如果主题帖列表的文本为空或出现错误，则返回验证失败
    return null;
  }

  // 二、对主题帖列表的文本再进行一次解析，抽取主题帖的相关信息

  // 主题帖列表
  let threadList = {};
  // 当前正在解析的主题帖的 ID （key）
  let currentKey = null;
  // 读取创建时间的开关
  let createTimeSwitch = false;
  // 读取最后回复时间开关
  let lastReplyTimeSwitch = false;
  // 在解析主题帖信息时是否发生错误
  let isErrorThreadInfo = false;

  // 页码
  let currentPageNo = null,
      lastPageNo = null;
  let currentPageNoSwitch = false;
  
  // 创建 inner parser 对主题帖列表文本进行解析
  let innerParser = new htmlparser2.Parser({
    onopentag: (name, attribs) => {
      if (name == 'li' && attribs.class && (attribs.class.trim() == 'j_thread_list clearfix' || attribs.class.trim() == 'j_thread_list thread_top j_thread_list clearfix')) {
        // 主题贴信息以json串的形式存在于该<li>标签的data-field属性内
        let dataField = parseDataField(attribs['data-field']);

        // 标记为当前主题帖
        currentKey = dataField.id.toString();

        // 保存主题帖的相关信息
        threadList[currentKey] = {
          threadId: dataField.id,
          authorName: dataField.author_name,
          authorNickname: dataField.author_nickname,
          replyNum: dataField.reply_num,

          // 贴吧 ID
          forumId: forumId
        };
      } else if (currentKey && name == 'a' && attribs.class && attribs.class.trim() == 'j_th_tit') {
        // 主题帖的标题
        threadList[currentKey].threadTitle = attribs.title;
      } else if (currentKey && name == 'span' && attribs.class && (attribs.class.trim() == 'tb_icon_author' || attribs.class.trim() == 'tb_icon_author no_icon_author')) {
        // 主题帖的作者，以json串的形式存在于该<span>标签的data-field属性内
        let dataField = parseDataField(attribs['data-field']);
        threadList[currentKey].authorId = dataField.user_id;
      } else if (currentKey && name == 'span' && attribs.class && attribs.class.trim() == 'pull-right is_show_create_time') {
        // 创建时间，打开开关，下一次 ontext 读取的便是创建时间
        createTimeSwitch = true;
      } else if (currentKey && name == 'span' && attribs.class && attribs.class.trim() == 'tb_icon_author_rely j_replyer') {
        // 最后回复人
        threadList[currentKey].lastReplier = attribs.title;
      } else if (currentKey && name == 'span' && attribs.class && attribs.class.trim() == 'threadlist_reply_date pull_right j_reply_data') {
        // 最后回复时间，打开开关，下一次 ontext 读取的便是最后回复时间
        lastReplyTimeSwitch = true;
      } else if (name == 'span' && attribs.class && attribs.class.trim() == 'pagination-current pagination-item') {
        // 当前页
        currentPageNoSwitch = true;
      } else if (name = 'a' && attribs.class && attribs.class.trim() == 'last pagination-item') {
        // 尾页
        try {
          let href = new URL('https:' + attribs.href);
          lastPageNo = parseInt(href.searchParams.get('pn')) / 50;
        } catch (err) {
          logger.info('validator/thread-list: fail to parse lastPageNo, err = ' + err);
          lastPageNo = null;
        }
      }
    },
    ontext: (data) => {
      if (createTimeSwitch) {
        // 读取创建时间
        threadList[currentKey].createTime = data.trim();
        createTimeSwitch = false;
      } else if (lastReplyTimeSwitch) {
        // 读取最后回复时间
        threadList[currentKey].lastReplyTime = data.trim();
        lastReplyTimeSwitch = false;
      } else if (currentPageNoSwitch) {
        // 当前页
        currentPageNo = parseInt(data.trim()) - 1;
        currentPageNoSwitch = false;
      }
    },
    onerror: (error) => {
      logger.info('validator/thread-list: parser on error: ' + error);
      isErrorThreadInfo = true;
    }
  });

  // 解析
  innerParser.write(threadListText);
  innerParser.end();

  if (isErrorThreadInfo) {
    // 如果在解析主题帖信息时发生错误，则返回验证失败
    logger.info('validator/thread-list: isErrorThreadInfo = ' + isErrorThreadInfo);
    return null;
  }

  if (currentPageNo == null || lastPageNo == null) {
    // 如果未能获取页码，则返回验证失败
    logger.info('validator/thread-list: fail to get page info, currentPageNo = ' + currentPageNo + ', lastPageNo = ' + lastPageNo);
    return null;
  } else {
    // 设置页码
    for (let k in threadList) {
      threadList[k].currentPageNo = currentPageNo;
      threadList[k].lastPageNo = lastPageNo;
    }
  }

  return threadList;
}
