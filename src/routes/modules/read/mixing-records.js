const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'record_id, record_line_id';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.machineCode) {
            filters.push('machine_code = ${machineCode}');
            filterParams.machineCode = req.query.machineCode;
        }

        if (req.query.mixingDateFrom) {
            filters.push('mixing_date >= ${mixingDateFrom}');
            filterParams.mixingDateFrom = req.query.mixingDateFrom;
        }

        if (req.query.mixingDateTo) {
            filters.push('mixing_date <= ${mixingDateTo}');
            filterParams.mixingDateTo = req.query.mixingDateTo;
        }

        if (req.query.adhesiveLot) {
            filters.push('adhesive_lot = ${adhesiveLot}');
            filterParams.adhesiveLot = req.query.adhesiveLot;
        }

        const mixingRecords = await db.any(`
            select ${field} from mixing_records
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(mixingRecords);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
