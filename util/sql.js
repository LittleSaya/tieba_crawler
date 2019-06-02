/**
 * 生成 sql
 */
module.exports = {
  /**
   * 从主题帖生成 sql
   * @param {object} thread
   * @returns {string}
   */
  thread: (thread) => {
    return 'INSERT INTO thread ' +
           '(thread_id, author_id, thread_title, create_time, last_reply_time, last_replier, reply_num, forum_id) VALUES ' +
           `(${thread.thread_id}, ${thread.author_id}, '${thread.title}', '${thread.create_time}', '${thread.last_reply_time}', '${thread.last_replier}', ${thread.reply_num}, ${thread.forum_id}) ` +
           'ON DUPLICATE KEY UPDATE ' +
           `thread_id = ${thread.thread_id}, ` +
           `author_id = ${thread.author_id}, ` +
           `thread_title = '${thread.title}', ` +
           `create_time = '${thread.create_time}', ` +
           `last_reply_time = '${thread.last_reply_time}', ` +
           `last_replier = '${thread.last_replier}', ` +
           `reply_num = ${thread.reply_num}, ` +
           `forum_id = ${thread.forum_id};`;
  },

  /**
   * 从跟帖生成 sql
   * @param {object} post
   * @returns {string}
   */
  post: (post) => {
    return 'INSERT INTO post ' +
           '(post_id, author_id, post_content, create_time, post_no, comment_num, thread_id) VALUES ' +
           `(${post.post_id}, ${post.author_id}, '${post.content}', '${post.reply_time}', ${post.post_no}, ${post.comment_num}, ${post.thread_id}) ` +
           'ON DUPLICATE KEY UPDATE ' +
           `post_id = ${post.post_id}, ` +
           `author_id = ${post.author_id}, ` +
           `post_content = '${post.content}', ` +
           `create_time = '${post.reply_time}', ` +
           `post_no = ${post.post_no}, ` +
           `comment_num = ${post.comment_num}, ` +
           `thread_id = ${post.thread_id};`;
  },

  /**
   * 从楼中楼生成 sql
   * @param {object} comment
   * @returns {string}
   */
  comment: (comment) => {
    return 'INSERT INTO comment ' +
           '(comment_id, author_id, comment_content, create_time, seq, post_id, thread_id) VALUES ' +
           `(${comment.comment_id}, ${comment.author_id}, '${comment.content}', '${comment.reply_time}', ${comment.seq}, ${comment.post_id}, ${comment.thread_id}) ` +
           'ON DUPLICATE KEY UPDATE ' +
           `comment_id = ${comment.comment_id}, ` +
           `author_id = ${comment.author_id}, ` +
           `comment_content = ${comment.content}, ` +
           `create_time = '${comment.reply_time}', ` +
           `seq = ${comment.seq}, ` +
           `post_id = ${comment.post_id}, ` +
           `thread_id = ${comment.thread_id};`;
  }
}
