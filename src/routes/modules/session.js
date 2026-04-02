const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');
const db = require('@/db');

const getCookieOptions = () => ({
    httpOnly: true,
    secure: false,
    sameSite: 'Strict',
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
});

const generateAccessToken = ({ id, name, role, permissions }) => {
    return jwt.sign(
        { id, name, role, permissions },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' }
    )
};

const generateRefreshToken = ({ id, name, role, permissions }) => {
    return jwt.sign(
        { id, name, role, permissions },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
};

router.post('/start', async (req, res, next) => {
    try {
        const { id, password } = req.body;

        const user = await db.oneOrNone(`
            select * from crud.users where id = \${id}
        `, { id });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new HttpError('INVALID_CREDENTIALS', 401);
        }

        const expiryDate = dayjs(user.expiryDate).endOf('day');
        if (user.role === 'guest' && expiryDate.isBefore(dayjs())) {
            throw new HttpError('USER_EXPIRED', 401);
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, getCookieOptions());
        res.status(200).json({ token: accessToken });
    } catch (err) {
        next(err);
    }
});

router.post('/auto/start', async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) throw new HttpError('TOKEN_NOT_FOUND', 401);

        const { id } = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) return reject(new HttpError('TOKEN_INVALID', 401));
                resolve(decoded);
            });
        });

        const user = await db.oneOrNone(`
            select * from crud.users where id = \${id}
        `, { id });
        if (!user) throw new HttpError('TOKEN_INVALID', 401);

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, getCookieOptions());
        res.status(200).json({ token: accessToken });
    } catch (err) {
        next(err);
    }
});

router.post('/end', (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(204);

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'Strict',
    });

    res.sendStatus(204);
});

module.exports = router;
