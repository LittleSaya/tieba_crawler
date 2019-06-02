/**
 * 将标签中的 data-field 属性处理为一个 js 对象
 * 将 &quot; 全部转换为 " （半角双引号）
 * @param {string} value
 * @returns {object}
 */
module.exports = function(value) {
  return JSON.parse(value.replace(/&quot;/g, '"'));
}
