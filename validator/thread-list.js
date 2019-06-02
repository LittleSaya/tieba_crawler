const htmlparser2 = require('htmlparser2');
const fs = require('fs');

var parseDataField = require('../util/parse-data-field');

/**
 * thread list validator
 * 验证某份文本是否是一个合法的主题帖的列表
 * 如果验证通过，则返回结果中的 isValid 为 true ，且 nextStage 为存储了一系列主题帖的对象
 * @param {string} text 传入的文本参数
 * @returns {object} { isValid: boolean, nextStage: object }
 */
module.exports = function(text) {
  // 保存主题帖列表页面
  if (global.debug) {
    fs.writeFile('out/thread-list.log', text, (err) => {
      if (err) {
        console.log('fail to save \'out/post-list.log\'');
      } else {
        console.log('\'out/thread-list.log\' saved');
      }
    });
  }

  // 获取贴吧 ID 和名称
  var forumId = null;
  var forumName = null;
  var regForumId = /PageData\.forum\s*=\s*\{\s*'id'\s*:\s*(\d+)\s*,\s*'name'\s*:\s*"(\S+)"/i;
  if (regForumId.test(text)) {
    forumId = RegExp.$1;

    // 将贴吧名称从字符串形式的 unicode 编码转换为真正的字符串
    forumName = RegExp.$2.replace(/\\u/g, ',');
    var codeList = forumName.split(',').slice(1);
    codeList.forEach((value, index, array) => {
      array[index] = parseInt(value, 16);
    })
    forumName = String.fromCharCode.apply(null, codeList);
  } else {
    // 未能找到贴吧 ID 和名称，验证失败
    console.log('fail to find forum id and name');
    return {
      isValid: false,
      nextStage: null
    };
  }

  // 一、对主题帖列表页面进行解析，获取文本格式的主题帖列表

  // 是否找到主题帖列表
  var isFoundThreadListText = false;
  // 是否已经获取主题帖列表
  var hasFoundThreadListText = false;
  // 在获取主题帖列表的过程中是否发生错误
  var isErrorThreadListText = false;
  // 主题帖列表的文本
  var threadListText = null;

  // 创建 outer parser ，用于寻找主题帖列表
  var outerParser = new htmlparser2.Parser({
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
      console.log(error);
      isErrorThreadListText = true;
    }
  });

  // 解析
  outerParser.write(text);
  outerParser.end();

  if (threadListText == null || isErrorThreadListText) {
    // 如果主题帖列表的文本为空或出现错误，则返回验证失败
    return {
      isValid: false,
      nextStage: null
    };
  }

  // 二、对主题帖列表的文本再进行一次解析，抽取主题帖的相关信息

  // 主题帖列表
  var threadList = {};
  // 当前正在解析的主题帖的 ID （key）
  var currentKey = null;
  // 读取创建时间的开关
  var createTimeSwitch = false;
  // 读取最后回复时间开关
  var lastReplyTimeSwitch = false;
  // 在解析主题帖信息时是否发生错误
  var isErrorThreadInfo = false;
  
  // 创建 inner parser 对主题帖列表文本进行解析
  var innerParser = new htmlparser2.Parser({
    onopentag: (name, attribs) => {
      if (name == 'li' && attribs.class && attribs.class.trim() == 'j_thread_list clearfix') {
        // 主题贴信息以json串的形式存在于该<li>标签的data-field属性内
        var dataField = parseDataField(attribs['data-field']);

        // 标记为当前主题帖
        currentKey = dataField.id.toString();

        // 保存主题帖的相关信息
        threadList[currentKey] = {
          thread_id: dataField.id,
          author_name: dataField.author_name,
          author_nickname: dataField.author_nickname,
          reply_num: dataField.reply_num,

          // 贴吧 ID
          forum_id: forumId
        };
      } else if (currentKey && name == 'a' && attribs.class && attribs.class.trim() == 'j_th_tit') {
        // 主题帖的标题
        threadList[currentKey].title = attribs.title;
      } else if (currentKey && name == 'span' && attribs.class && attribs.class.trim() == 'tb_icon_author') {
        // 主题帖的作者，以json串的形式存在于该<span>标签的data-field属性内
        var dataField = parseDataField(attribs['data-field']);
        threadList[currentKey].author_id = dataField.user_id;
      } else if (currentKey && name == 'span' && attribs.class && attribs.class.trim() == 'pull-right is_show_create_time') {
        // 创建时间，打开开关，下一次 ontext 读取的便是创建时间
        createTimeSwitch = true;
      } else if (currentKey && name == 'span' && attribs.class && attribs.class.trim() == 'tb_icon_author_rely j_replyer') {
        // 最后回复人
        threadList[currentKey].last_replier = attribs.title;
      } else if (currentKey && name == 'span' && attribs.class && attribs.class.trim() == 'threadlist_reply_date pull_right j_reply_data') {
        // 最后回复时间，打开开关，下一次 ontext 读取的便是最后回复时间
        lastReplyTimeSwitch = true;
      }
    },
    ontext: (data) => {
      if (createTimeSwitch) {
        // 读取创建时间
        threadList[currentKey].create_time = data.trim();
        // 读取完毕后关闭开关
        createTimeSwitch = false;
      } else if (lastReplyTimeSwitch) {
        // 读取最后回复时间
        threadList[currentKey].last_reply_time = data.trim();
        // 关闭开关
        lastReplyTimeSwitch = false;
      }
    },
    onerror: (error) => {
      console.log(error);
      isErrorThreadInfo = true;
    }
  });

  // 解析
  innerParser.write(threadListText);
  innerParser.end();

  if (isErrorThreadInfo) {
    // 如果在解析主题帖信息时发生错误，则返回验证失败
    return {
      isValid: false,
      nextStage: null
    };
  }

  return {
    isValid: true,
    nextStage: {
      forum: {
        id: forumId,
        name: forumName
      },
      threadList: threadList
    }
  };
}
