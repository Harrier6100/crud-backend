const errorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err);

    console.error(err);
    if (err instanceof HttpError) {
        return res.status(err.status).json({
            message: err.message,
        });
    }

    return res.status(500).json({
        message: err.message,
    });
};

module.exports = errorHandler;
