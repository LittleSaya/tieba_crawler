const htmlparser2 = require('htmlparser2');
const logger = require('../util/logger');
const parseDataField = require('../util/parse-data-field');

/**
 * comment list validator
 * 验证某份文本是否是一个合法的楼中楼回复列表
 * 如果验证通过，则返回楼中楼列表，否则返回 null
 * @param {string} text 传入的文本参数
 * @returns {Array}
 */
module.exports = function(text) {
  // 楼中楼回复列表
  let commentList = {};
  // 当前 key
  let currentKey = null;
  // 楼中楼回复内容开关
  let commentContentSwitch = false;
  // 楼中楼回复时间开关
  let commentReplyTimeSwitch = false;
  // 解析过程中是否出现错误
  let isErrorCommentList = false;
  
  // 计数
  //let count = 0;

  // 创建 parser
  let parser = new htmlparser2.Parser({
    onopentag: (name, attribs) => {
      if (name == 'li' && attribs.class && (
        attribs.class.trim() == 'lzl_single_post j_lzl_s_p first_no_border' ||
        attribs.class.trim() == 'lzl_single_post j_lzl_s_p')) {
        // 新的楼中楼回复
        let dataField = parseDataField(attribs['data-field']);
        
        // 设置 key
        currentKey = dataField.spid.toString();
        commentList[currentKey] = {
          commentId: parseInt(dataField.spid),
          authorName: dataField.user_name,
          commentContent: '',
          seq: parseInt(dataField.spid)
        };
      } else if (currentKey && name == 'span' && attribs.class && attribs.class.trim() == 'lzl_content_main') {
        // 打开楼中楼回复内容开关
        commentContentSwitch = true;
      } else if (currentKey && commentContentSwitch && (name == 'img' || name == 'a')) {
        // 楼中楼回复内容中的图片和链接
        let attrString = '';
        for (i in attribs) {
          attrString += i + '="' + attribs[i] + '" ';
        }
        if (name == 'img') {
          let img = '<img ' + attrString + '/>';
          commentList[currentKey].commentContent += img;
        } else {
          let a = '<a ' + attrString + '>';
          commentList[currentKey].commentContent += a;
        }
      } else if (currentKey && name == 'span' && attribs.class && attribs.class.trim() == 'lzl_time') {
        // 打开楼中楼回复时间开关
        commentReplyTimeSwitch = true;
      }
      /*else if (name == 'li' && attribs.class && attribs.class.trim() == 'lzl_li_pager j_lzl_l_p lzl_li_pager_s') {
        // 总回复数和页数
        let dataField = parseDataField(attribs['data-field']);
        totalNum = dataField.total_num;
        totalPage = dataField.total_page;
      }*/
    },
    onclosetag: (name) => {
      if (currentKey && commentContentSwitch && name == 'span') {
        // 关闭楼中楼回复内容开关
        commentContentSwitch = false;
      } else if (currentKey && commentContentSwitch && name == 'a') {
        // 楼中楼回复中的链接的 close tag
        commentList[currentKey].commentContent += '</a>';
      }
    },
    ontext: (data) => {
      if (currentKey && commentContentSwitch) {
        // 追加新的回复内容
        commentList[currentKey].commentContent += data.trim();
      } else if (currentKey && commentReplyTimeSwitch) {
        // 回复时间
        commentList[currentKey].createTime = data.trim();
        commentReplyTimeSwitch = false;
      }
    },
    onerror: (error) => {
      logger.info('validator/comment-list: parser on error: ' + error);
      isErrorCommentList = true;
    }
  });

  parser.write(text);
  parser.end();

  if (isErrorCommentList) {
    logger.info('validator/comment-list: isErrorCommentList = ' + isErrorCommentList);
    return null;
  }

  return commentList;
}
