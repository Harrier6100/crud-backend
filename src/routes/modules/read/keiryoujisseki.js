const express = require('express');
const router = express.Router();
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ?? '*';
        const sort = req.query.sort ?? 'norilotno';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.norilotno) {
            filters.push('norilotno = ${norilotno}');
            filterParams.norilotno = req.query.norilotno;
        }

        if (req.query.koujoulotno) {
            filters.push('koujoulotno = ${koujoulotno}');
            filterParams.koujoulotno = req.query.koujoulotno;
        }

        const keiryoujisseki = await db.any(`
            select ${field} from keiryoujisseki
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(keiryoujisseki);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
