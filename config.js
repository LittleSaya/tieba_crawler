const constant = require('./constant');
const cookie = require('./cookie');

/**
 * 配置
 */
module.exports = {
    request: {
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Cookie': cookie,
            'Host': 'tieba.baidu.com',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36 OPR/58.0.3135.132'
        },

        // 超时时间（10s）
        timeout: 10000,

        // 请求失败时的重试次数
        retryTimes: 3,
    },

    // 命令行的默认配置
    command: {
        target: constant.command.value.target.threadListWithContent,
        threadListPageStart: 0,
        threadListPageEnd: Infinity,
        postListPageStart: 0,
        postListPageEnd: Infinity,
        commentListPageStart: 0,
        commentListPageEnd: Infinity,

        // 默认生成 log 文件
        outputTarget: constant.command.value.outputTarget.log
    }
};