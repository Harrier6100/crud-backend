const express = require('express');
const router = express.Router();
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const { period, machineCode } = req.query;

        const filters = [];
        const filterParams = {};

        if (period) {
            filters.push('left(transaction_date, 6) = ${period}');
            filterParams.period = period;
        }

        if (machineCode) {
            filters.push('machine_code = ${machineCode}');
            filterParams.machineCode = machineCode;
        }

        filters.push("category_code_1 = '40'");
        filters.push("transaction_type = '1'");
        filters.push("machine_type in ('2A','3A','3F')");

        const voc = await db.any(`
            select distinct
                left(transaction_date, 6) as period,
                material_code,
                material_name,
                round(sum(transaction_qty) over (partition by material_code, left(transaction_date, 6)), 2) as transaction_qty
            from material_journals
            where ${filters.join(' and ')}
            order by material_code, period
        `, filterParams);

        res.status(200).json(voc);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
