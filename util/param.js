/**
 * 判断参数是否为字符串字
 * @param {any} val
 */
function isString(val) {
  return (typeof val == 'string' || (val instanceof String));
}

/**
 * 判断参数是否为数字
 * @param {any} val
 */
function isNumber(val) {
  return (typeof val == 'number' || (val instanceof Number));
}

/**
 * 判断参数是否为一个整数
 * @param {any} val
 * @returns {boolean}
 */
function isInt(val) {
  if (!isNumber(val)) {
    try {
      val = new Number(val);
    } catch (err) {
      return false;
    }
  }
  return Number.isInteger(val.valueOf());
}

/**
 * 判断参数是否是一个空对象
 * 如果参数是数组的话，判断其大小是否为 0
 * 如果参数是对象的话，判断其内部是否有成员
 * @param {object} val
 * @returns {boolean}
 */
function isEmptyObject(val) {
  if (val instanceof Array) {
    return val.length == 0;
  } else if (val instanceof Object) {
    // 成员计数
    var cnt = 0;
    for (i in val) {
      ++cnt;
    }
    return cnt == 0;
  }
}

/**
 * 用于处理各种参数的工具模块
 */
module.exports = {
  isInt: isInt,
  isNumber: isNumber,
  isString: isString,
  isEmptyObject: isEmptyObject
}
