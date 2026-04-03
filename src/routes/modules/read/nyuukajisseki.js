const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'koujoulotno';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.koujoulotno) {
            filters.push('koujoulotno = ${koujoulotno}');
            filterParams.koujoulotno = req.query.koujoulotno;
        }

        const nyuukajisseki = await db.any(`
            select ${field} from nyuukajisseki
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(nyuukajisseki);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
