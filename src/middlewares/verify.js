const verifyToken = require('@/middlewares/verifyToken');
const verifyPermission = require('@/middlewares/verifyPermission');

const verify = (permission) => permission
    ? [verifyToken, verifyPermission(permission)]
    : [verifyToken];

module.exports = verify;
