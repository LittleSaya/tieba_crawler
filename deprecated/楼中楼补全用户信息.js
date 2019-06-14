
  // 补全用户信息
  // 用户缓存
  let userCache = {};

  for (let i in commentList.commentList) {
    let userName = commentList.commentList[i].author_name;

    if (userCache[userName]) {
      // 如果用户名在缓存内，则直接使用缓存中的值
      commentList.commentList[i].author_id = userCache[userName];
    } else {
      // 如果用户名不在缓存内，则调用 getter 获取用户 ID
      try {
        let userId = await userPageGetter(userName);
        userCache[userName] = userId;
        commentList.commentList[i].author_id = userCache[userName];
      } catch (err) {
        console.log(err);
        throw new Error(`getter/comment-list: fail to get userId of userName '${userName}' when getting comment`)
      }
    }
  }