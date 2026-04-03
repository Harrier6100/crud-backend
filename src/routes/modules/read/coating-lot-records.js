const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'coating_lot';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.coatingLot) {
            filters.push('coating_lot = ${coatingLot}');
            filterParams.coatingLot = req.query.coatingLot;
        }

        const coatingLotRecords = await db.any(`
            select ${field} from coating_lot_records
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(coatingLotRecords);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
