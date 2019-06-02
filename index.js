/**
 * 启动参数：
 * target=[target_name] 爬取目标
 *   target_name:
 *     'thread_list':只爬取帖子列表
 *     'thread':爬取指定帖子
 *     'thread_list_with_content':爬取帖子列表，以及帖子的内容
 * 
 * tieba=[tieba_name] 贴吧名称
 * 
 * 当 target_name=thread_list 时支持的参数：
 *   thread_list_page_start=[thread_list_page_start] 主题帖列表的开始页（从0开始）（可选）
 *   thread_list_page_end=[thread_list_page_end] 主题贴列表的结束页（开始页从0开始）（可选）
 *   output_target=[output_target_name] 爬取结果的输出目标（可选）
 *     output_target_name:
 *       'console': 输出至控制台（默认）
 *       'log': 以日志文件存储
 * 
 * 当 target_name=thread 时支持的参数：
 *   thread_id=[thread_id] 主题帖ID
 *   post_list_page_start=[post_list_page_start] 跟帖列表的开始页（从0开始）（可选）
 *   post_list_page_end=[post_list_page_end] 跟帖列表的结束页（开始页从0开始）（可选）
 *   comment_list_page_start=[comment_list_page_start] 楼中楼开始页（从0开始）（可选）
 *   comment_list_page_end=[comment_list_page_end] 楼中楼结束页（从0开始）（可选）
 *   output_target=[output_target_name] 爬取结果的输出目标（可选）
 *     output_target_name:
 *       'console': 输出至控制台（默认）
 *       'log': 以日志文件存储
 * 
 * 当 target_name=thread_list_with_content 时支持的参数：
 *   thread_list_page_start=[thread_list_page_start] 主题帖列表的开始页（从0开始）（可选）
 *   thread_list_page_end=[thread_list_page_end] 主题贴列表的结束页（开始页从0开始）（可选）
 *   post_list_page_start=[post_list_page_start] 跟帖列表的开始页（从0开始）（可选）
 *   post_list_page_end=[post_list_page_end] 跟帖列表的结束页（开始页从0开始）（可选）
 *   comment_list_page_start=[comment_list_page_start] 楼中楼开始页（从0开始）（可选）
 *   comment_list_page_end=[comment_list_page_end] 楼中楼结束页（从0开始）（可选）
 *   output_target=[output_target_name] 爬取结果的输出目标（可选）
 *     output_target_name:
 *       'console': 输出至控制台（默认）
 *       'log': 以日志文件存储
 *       'sql': 生成sql语句（insert语句）
 */

var constant = require('./constant').command;

var threadListTask = require('./task/thread-list');
var threadTask = require('./task/thread');

var argvUtil = require('./util/argv');

async function main() {
  // 获取命令行参数
  var argv = argvUtil(process.argv);

  // 根据 debug 参数的值判断是否开启 debug 模式
  if (argv.debug) {
    global.debug = true;
  }

  if (argv.target) {
    // 必须指定一个在指定范围内的 target
    // 根据 target 调用相对应的 task
    switch (argv.target) {
      case constant.value.target.thread:
        await threadTask(argv);
        break;
      case constant.value.target.threadList:
        await threadListTask(argv);
        break;
      case constant.value.target.threadListWithContent:
        // TODO
        break;
      default:
        console.log(`unknown target '${argv.target}'`);
        return;
    }
  } else {
    console.log('\'target\' not found in cmd params');
  }
}

main();
