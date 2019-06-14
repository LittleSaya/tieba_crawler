const winston = require('winston');

module.exports = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: [
    new winston.transports.Console({ level: 'debug' }),
    new winston.transports.File({ filename: 'log.log', level: 'debug' })
  ]
});
