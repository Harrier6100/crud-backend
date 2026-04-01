const log4js = require('log4js');
log4js.configure('./src/config/log4js.json');
const logger = log4js.getLogger('error');

const errorLogger = (err, req, res, next) => {
    const statusCode = err.status || res.statusCode;
    if (statusCode === 500) {
        const { socket, method, originalUrl } = req;
        const ip = socket.remoteAddress.replace('::ffff:', '');
        logger.error(`[${ip}] ${method} ${statusCode} ${originalUrl}\n${err.stack || err.toString()}`);
    }

    next(err);
};

module.exports = errorLogger;
