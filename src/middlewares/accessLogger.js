const log4js = require('log4js');
log4js.configure('./src/config/log4js.json');
const logger = log4js.getLogger('access');

const accessLogger = (req, res, next) => {
    const { socket, method, originalUrl } = req;
    const ip = socket.remoteAddress.replace('::ffff:', '');

    res.on('finish', () => {
        logger.info(`[${ip}] ${method} ${res.statusCode} ${originalUrl}`);
    });

    next();
};

module.exports = accessLogger;
