const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'record_id';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.recordId) {
            filters.push('record_id = ${recordId}');
            filterParams.recordId = req.query.recordId;
        }

        if (req.query.planId) {
            filters.push('plan_id = ${planId}');
            filterParams.planId = req.query.planId;
        }

        if (req.query.machineCode) {
            filters.push('machine_code = ${machineCode}');
            filterParams.machineCode = req.query.machineCode;
        }

        if (req.query.cuttingDateFrom) {
            filters.push('cutting_date >= ${cuttingDateFrom}');
            filterParams.cuttingDateFrom = req.query.cuttingDateFrom;
        }

        if (req.query.cuttingDateTo) {
            filters.push('cutting_date <= ${cuttingDateTo}');
            filterParams.cuttingDateTo = req.query.cuttingDateTo;
        }

        const cuttingRecords = await db.any(`
            select ${field} from cutting_records
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(cuttingRecords);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
