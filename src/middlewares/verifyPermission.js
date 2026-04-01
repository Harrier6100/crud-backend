const verifyPermission = (required) => {
    return (req, res, next) => {
        const { permissions } = req.user;
        if (req.user.role === 'admin') return next();
        const can = permissions.includes(required)
        if (!can) return next(new HttpError('FORBIDDEN', 403));
        next();
    };
};

module.exports = verifyPermission;
