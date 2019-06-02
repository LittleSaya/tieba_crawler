const htmlparser2 = require('htmlparser2');
const fs = require('fs');

var parseDataField = require('../util/parse-data-field');

/**
 * post list validator
 * 验证某份文本是否是一个合法的跟帖的列表
 * 如果验证通过，则返回结果中的 isValid 为 true ，且 nextStage 为存储了一系列跟帖的对象
 * @param {string} text 传入的文本参数
 * @returns {object} { isValid: boolean, nextStage: object }
 */
module.exports = function(text) {
  // 保存跟帖列表页面
  if (global.debug) {
    fs.writeFile('out/post-list.log', text, (err) => {
      if (err) {
        console.log('fail to save \'out/post-list.log\'');
      } else {
        console.log('\'out/post-list.log\' saved');
      }
    });
  }

  // 一、使用正则表达式解析当前页码和总页数
  var curPage = null;
  var totalPage = null;
  var regPager = /PageData\.pager\s*=\s*\{\s*"cur_page"\s*:\s*(\d+)\s*,\s*"total_page"\s*:\s*(\d+)\s*\}/i;
  if (!regPager.test(text)) {
    // 如果无法解析页码信息，返回验证失败
    console.log('fail to parse PageData');
    return {
      isValid: false,
      nextStage: null
    };
  } else {
    curPage = parseInt(RegExp.$1);
    totalPage = parseInt(RegExp.$2);
  }

  // 二、对跟帖列表页面进行解析

  // 当前的 key （当前跟帖的 ID ）
  var currentKey = null;
  // 是否出错
  var isErrorPostList = false;
  // 读取回帖时间开关
  var replyTimeSwitch = false;
  // 跟帖列表
  var postList = {};

  // 回帖时间正则表达式
  var regReplyTime = /\d{4}\-\d{2}\-\d{2}\s\d{2}:\d{2}/;

  // 创建 parser
  var parser = new htmlparser2.Parser({
    onopentag: (name, attribs) => {
      if (name == 'div' && attribs.class && attribs.class.trim() == 'l_post l_post_bright j_l_post clearfix') {
        var dataField = parseDataField(attribs['data-field']);

        // 设置当前的 key
        currentKey = dataField.content.post_id.toString();
        postList[currentKey] = {
          // 跟帖 ID ，贴吧 ID ，主题帖 ID
          post_id: dataField.content.post_id,
          forum_id: dataField.content.forum_id,
          thread_id: dataField.content.thread_id,
          // 跟帖内容
          content: dataField.content.content,
          // 楼层
          post_no: dataField.content.post_no,
          // 作者 ID ，用户名，昵称
          author_id: dataField.author.user_id,
          author_name: dataField.author.user_name,
          author_nickname: dataField.author.user_nickname,
          // 楼中楼回复数
          comment_num: dataField.content.comment_num
        };
      } else if (currentKey && name == 'span' && attribs.class && attribs.class.trim() == 'tail-info') {
        // 打开回帖时间开关
        replyTimeSwitch = true;
      }
    },
    ontext: (data) => {
      if (currentKey && replyTimeSwitch) {
        if (regReplyTime.test(data.trim())) {
          postList[currentKey].reply_time = data.trim();
        }
        replyTimeSwitch = false;
      }
    },
    onerror: (error) => {
      console.log(error);
      isErrorPostList = true;
    }
  });

  // 解析
  parser.write(text);
  parser.end();

  if (isErrorPostList) {
    // 如果在解析过程中发生错误，则返回验证失败
    return {
      isValid: false,
      nextStage: null
    };
  }

  return {
    isValid: true,
    nextStage: {
      page: {
        cur_page: curPage,
        total_page: totalPage
      },
      postList: postList
    }
  };
}
