const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return next(new HttpError('UNAUTHORIZED', 401));

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return next(new HttpError('TOKEN_INVALID', 401));
        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;
