
  let currentPageNo = null;
  let currentPageNoReg = /<span\s+class\s*=\s*"tP">\s*(\d+)\s*<\/span>/i;
  if (currentPageNoReg.test(text)) {
    currentPageNo = parseInt(RegExp.$1);
  } else {
    logger.info('validator/comment-list: fail to find current page no');
    return null;
  }