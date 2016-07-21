const path    = require('path');
const winston = require('winston');
const _       = require('lodash');

const COLORIZE = process.env.NODE_ENV === 'development';

function createLogger(filePath) {
  const fileName = path.basename(filePath);
  const label = `mankov${fileName ? '-' + fileName : ''}`;

  const logger = new winston.Logger({
    transports: [new winston.transports.Console({
      colorize: COLORIZE,
      label,
      timestamp: true
    })]
  });

  _setLevelForTransports(logger, process.env.LOG_LEVEL || 'debug');
  return logger;
}

function _setLevelForTransports(logger, level) {
  _.each(logger.transports, transport => {
    transport.level = level;
  });
}

module.exports = createLogger;
