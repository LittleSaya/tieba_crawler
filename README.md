# 百度贴吧爬虫

开发中

# CMD

node index tieba=腐姬 target=thread_list output_target=sql thread_list_page_start=0 thread_list_page_end=3

# TODO

- 在 task/thread-list.js 中，用 promise 包装 js.writeFile ，使报错能够提供贴吧名称和页码等更详细的信息
- 把所有的 var 都改成 let
- 不要把敏感信息上传到 github 上（ cookie ）

# 设计不合理的地方

- comment list validator 并没有获取完整的 comment 信息，其中一部分是在 comment list getter 中补全的（ post_id 和 thread_id ）
