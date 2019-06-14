
  // 一、使用正则表达式解析当前页码和总页数
  let curPage = null;
  let totalPage = null;
  let regPager = /PageData\.pager\s*=\s*\{\s*"cur_page"\s*:\s*(\d+)\s*,\s*"total_page"\s*:\s*(\d+)\s*\}/i;
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
  