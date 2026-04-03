const path = require('path');
const express = require('express');
const cors = require('cors');
const cookie = require('cookie-parser');
const compression = require('compression');
const cacheControl = require('@/middlewares/cacheControl');
const accessLogger = require('@/middlewares/accessLogger');
const errorLogger = require('@/middlewares/errorLogger');
const errorHandler = require('@/middlewares/errorHandler');
global.verify = require('@/middlewares/verify');
global.HttpError = require('@/errors/HttpError');

const corsOptions = {
    origin: true,
    credentials: true,
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corsOptions));
app.use(cookie());
app.use(compression());
app.use(cacheControl);
app.use(accessLogger);
app.use('/api', require('@/routes'));
app.use(errorLogger);
app.use(errorHandler);

module.exports = app;
