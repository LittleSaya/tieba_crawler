const htmlparser2 = require('htmlparser2');
const logger = require('../util/logger');
const parseDataField = require('../util/parse-data-field');

/**
 * post list validator
 * 验证某份文本是否是一个合法的跟帖的列表
 * 如果验证通过，则返回跟帖列表，否则返回 null
 * @param {string} text 传入的文本参数
 * @returns {object}
 */
module.exports = function(text) {
  // 零、使用正则表达式解析当前页码和总页数
  let curPage = null;
  let totalPage = null;
  let regPager = /PageData\.pager\s*=\s*\{\s*"cur_page"\s*:\s*(\d+)\s*,\s*"total_page"\s*:\s*(\d+)\s*\}/i;
  if (!regPager.test(text)) {
    // 如果无法解析页码信息，返回验证失败
    logger.info('validator/post-list: fail to parse PageData');
    return null;
  } else {
    curPage = parseInt(RegExp.$1);
    totalPage = parseInt(RegExp.$2);
  }

  // 一、对跟帖列表页面进行解析

  // 当前的 key （当前跟帖的 ID ）
  let currentKey = null;
  // 是否出错
  let isErrorPostList = false;
  // 读取回帖时间开关
  let replyTimeSwitch = false;
  // 跟帖列表
  let postList = {};

  // 回帖时间正则表达式
  let regReplyTime = /\d{4}\-\d{2}\-\d{2}\s\d{2}:\d{2}/;

  // 创建 parser
  let parser = new htmlparser2.Parser({
    onopentag: (name, attribs) => {
      if (name == 'div' && attribs.class && attribs.class.trim() == 'l_post l_post_bright j_l_post clearfix') {
        // 新的跟帖
        let dataField = parseDataField(attribs['data-field']);

        // 设置当前的 key
        currentKey = dataField.content.post_id.toString();
        postList[currentKey] = {
          // 跟帖 ID ，贴吧 ID ，主题帖 ID
          postId: dataField.content.post_id,
          forumId: dataField.content.forum_id,
          threadId: dataField.content.thread_id,
          // 跟帖内容
          postContent: dataField.content.content,
          // 楼层
          postNo: dataField.content.post_no,
          // 作者 ID ，用户名，昵称
          authorId: dataField.author.user_id,
          authorName: dataField.author.user_name,
          authorNickname: dataField.author.user_nickname,
          // 楼中楼回复数
          commentNum: dataField.content.comment_num,

          // 跟帖的所属页码与总页数
          pageNo: curPage,
          totalPage: totalPage
        };
      } else if (currentKey && name == 'span' && attribs.class && attribs.class.trim() == 'tail-info') {
        // 打开回帖时间开关
        replyTimeSwitch = true;
      }
    },
    ontext: (data) => {
      if (currentKey && replyTimeSwitch) {
        if (regReplyTime.test(data.trim())) {
          postList[currentKey].createTime = data.trim();
        }
        replyTimeSwitch = false;
      }
    },
    onerror: (error) => {
      logger.info('validator/post-list: parser on error: ' + error);
      isErrorPostList = true;
    }
  });

  // 解析
  parser.write(text);
  parser.end();

  if (isErrorPostList) {
    // 如果在解析过程中发生错误，则返回验证失败
    logger.info('validator/post-list: isErrorPostList = ' + isErrorPostList);
    return null;
  }

  return postList;
}
