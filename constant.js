/**
 * 常量定义
 */
module.exports = {
  // 命令行常量
  command: {
    name: {
      target: 'target',
      tieba: 'tieba',
      threadId: 'thread_id',
      threadListPageStart: 'thread_list_page_start',
      threadListPageEnd: 'thread_list_page_end',
      postListPageStart: 'post_list_page_start',
      postListPageEnd: 'post_list_page_end',
      commentListPageStart: 'comment_list_page_start',
      commentListPageEnd: 'comment_list_page_end',
      outputTarget: 'output_target',
      debug: 'debug'
    },
    value: {
      target: {
        threadList: 'thread_list',
        thread: 'thread',
        threadListWithContent: 'thread_list_with_content'
      },
      outputTarget: {
        console: 'console',
        log: 'log',
        sql: 'sql',
        database: 'database'
      }
    }
  }
}
