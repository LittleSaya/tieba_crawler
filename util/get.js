const axios = require('axios');
const config = require('../config');
const logger = require('./logger');

/**
 * 对指定URL发起GET请求，将反馈以字符串的形式返回
 * 当请求失败时（包括验证失败），会根据配置文件中的设置重试指定次数
 * 如果多次重试均失败，则抛出Error
 * @param {string} url
 * @param {object} params
 */
module.exports = async function(url, params) {
  let retryCount = 0;

  let data = null;

  while (retryCount <= config.request.retryTimes) {
    try {
      let response = await axios.get(url, {
        headers: config.request.headers,
        params: params,
        timeout: config.request.timeout,
        responseType: 'text',
        validateStatus: status => { return status == 200; }
      });

      data = response.data;
      break;
    } catch (err) {
      logger.info('util/get: request failed, url=' + url);
      logger.info('util/get: request failed, err=' + err);

      // 失败重试次数 +1
      ++retryCount;
    }
  }

  if (data == null) {
    // data 为 null 表示请求失败或 validator 返回 false
    // 抛出异常
    throw new Error('util/get: request failed, url=' + url + ', params=' + JSON.stringify(params));
  } else {
    return data;
  }
}
