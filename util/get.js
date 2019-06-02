const axios = require('axios');
const config = require('../config');

/**
 * 对指定URL发起GET请求，将反馈以字符串的形式返回
 * 当请求失败时（包括验证失败），会根据配置文件中的设置重试指定次数
 * 如果多次重试均失败，则抛出Error
 * @param {string} url
 * @param {object} params
 * @param {function} validator
 */
module.exports = async function(url, params, validator) {
  var retryCount = 0;

  var data = null;

  while (retryCount <= config.request.retryTimes) {
    try {
      var response = await axios.get(url, {
        headers: config.request.headers,
        params: params,
        timeout: config.request.timeout,
        responseType: 'text',
        validateStatus: status => { return status == 200; }
      });

      if (validator && typeof validator == 'function') {
        // 如果提供了 validator 且 validator 为函数，则调用 validator 对返回的数据进行验证
        var validResult = validator(response.data);
        if (validResult.isValid) {
          // 验证成功，返回 nextStage
          data = validResult.nextStage;
          break;
        } else {
          // 验证失败抛出 Error
          throw new Error('validator returns false');
        }
      } else {
        // 如果未提供合法的 validator ，则返回原始的请求结果
        data = response.data;
        break;
      }
    } catch (err) {
      console.log('request failed: ' + err);
      console.log('url=' + url);

      // 失败重试次数 +1
      ++retryCount;
    }
  }

  if (data == null) {
    // data 为 null 表示请求失败或 validator 返回 false
    // 抛出异常
    throw new Error('request failed, url=' + url + ', params=' + JSON.stringify(params));
  } else {
    return data;
  }
}
