const logger = require('./logger');

module.exports = {
  /**
   * 字符串转时间，其中字符串按照本地时间解析
   * @param {string} str 代表时间的字符串，应该符合 yyyy-mm-dd hh:mm 的格式
   * @returns {Date} 时间
   */
  parseStr: function(str) {
    let date = new Date(0);
    try {
      let dateAndTime = str.split(' ');
      let dateArr = dateAndTime[0].split('-');
      let timeArr = dateAndTime[1].split(':');
      let year = parseInt(dateArr[0]);
      let month = parseInt(dateArr[1]);
      let day = parseInt(dateArr[2]);
      let hour = parseInt(timeArr[0]);
      let minute = parseInt(timeArr[1]);
      date.setFullYear(year, month - 1, day);
      date.setHours(hour, minute, 0, 0);
      return date;
    } catch (err) {
      logger.info('util/date.parseStr: fail to parse string to date, return new Date(0), err = ' + err + ', str = ' + str);
      return new Date(0);
    }
  }
}