const htmlparser2 = require('htmlparser2');
const fs = require('fs');

var parseDataField = require('../util/parse-data-field');

/**
 * comment list validator
 * 验证某份文本是否是一个合法的楼中楼回复列表
 * 如果验证通过，则返回结果中的 isValid 为 true ，且 nextStage 为存储了一系列楼中楼回复的对象
 * @param {string} text 传入的文本参数
 * @returns {object} { isValid: boolean, nextStage: object }
 */
module.exports = function(text) {
  // 保存楼中楼列表页面
  if (global.debug) {
    fs.writeFile('out/comment-list.log', text, (err) => {
      if (err) {
        console.log('fail to save \'out/comment-list.log\'');
      } else {
        console.log('\'out/comment-list.log\' saved');
      }
    });
  }

  // 总回复数和页数
  var totalNum = null;
  var totalPage = null;
  // 楼中楼回复列表
  var commentList = {};
  // 当前 key
  var currentKey = null;
  // 楼中楼回复内容开关
  var commentContentSwitch = false;
  // 楼中楼回复时间开关
  var commentReplyTimeSwitch = false;
  // 解析过程中是否出现错误
  var isErrorCommentList = false;

  // 创建 parser
  var parser = new htmlparser2.Parser({
    onopentag: (name, attribs) => {
      if (name == 'li' && attribs.class && (
        attribs.class.trim() == 'lzl_single_post j_lzl_s_p first_no_border' ||
        attribs.class.trim() == 'lzl_single_post j_lzl_s_p')) {
        // 新的楼中楼回复
        var dataField = parseDataField(attribs['data-field']);
        
        // 设置 key
        currentKey = dataField.spid.toString();
        commentList[currentKey] = {
          comment_id: parseInt(dataField.spid),
          author_name: dataField.user_name,
          content: ''
        };
      } else if (currentKey && name == 'span' && attribs.class && attribs.class.trim() == 'lzl_content_main') {
        // 打开楼中楼回复内容开关
        commentContentSwitch = true;
      } else if (currentKey && commentContentSwitch && (name == 'img' || name == 'a')) {
        // 楼中楼回复内容中的图片和链接
        var attrString = '';
        for (i in attribs) {
          attrString += i + '="' + attribs[i] + '" ';
        }
        if (name == 'img') {
          var img = '<img ' + attrString + '/>';
          commentList[currentKey].content += img;
        } else {
          var a = '<a ' + attrString + '>';
          commentList[currentKey].content += a;
        }
      } else if (currentKey && name == 'span' && attribs.class && attribs.class.trim() == 'lzl_time') {
        // 打开楼中楼回复时间开关
        commentReplyTimeSwitch = true;
      } else if (name == 'li' && attribs.class && attribs.class.trim() == 'lzl_li_pager j_lzl_l_p lzl_li_pager_s') {
        // 总回复数和页数
        var dataField = parseDataField(attribs['data-field']);
        totalNum = dataField.total_num;
        totalPage = dataField.total_page;
      }
    },
    onclosetag: (name) => {
      if (currentKey && commentContentSwitch && name == 'span') {
        // 关闭楼中楼回复内容开关
        commentContentSwitch = false;
      } else if (currentKey && commentContentSwitch && name == 'a') {
        // 楼中楼回复中的链接的 close tag
        commentList[currentKey].content += '</a>';
      }
    },
    ontext: (data) => {
      if (currentKey && commentContentSwitch) {
        // 追加新的回复内容
        commentList[currentKey].content += data.trim();
      } else if (currentKey && commentReplyTimeSwitch) {
        // 回复时间
        commentList[currentKey].reply_time = data.trim();
        commentReplyTimeSwitch = false;
      }
    },
    onerror: (error) => {
      console.log(error);
      isErrorCommentList = true;
    }
  });

  parser.write(text);
  parser.end();

  // TODO 重新考虑 totalNum 和 totalPage 这两个值
  if (isErrorCommentList /* || typeof totalNum != 'number' || typeof totalPage != 'number' */) {
    console.log('validator/comment-list: error, \'totalNum\' is not a number, or \'totalPage\' is not a number');
    // 如果出错，或者未能获取页码信息，则返回验证失败
    return {
      isValid: false,
      nextStage: null
    };
  }

  return {
    isValid: true,
    nextStage: {
      page: {
        total_num: totalNum,
        total_page: totalPage
      },
      commentList: commentList
    }
  };
}
