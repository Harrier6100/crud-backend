const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'plan_id';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.planId) {
            filters.push('plan_id = ${planId}');
            filterParams.planId = req.query.planId;
        }

        if (req.query.rpNumber) {
            filters.push('rp_number = ${rpNumber}');
            filterParams.rpNumber = req.query.rpNumber;
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

        if (req.query.productCode) {
            filters.push('product_code = ${productCode}');
            filterParams.productCode = req.query.productCode;
        }

        const cuttingPlans = await db.any(`
            select ${field} from cutting_plans
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(cuttingPlans);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
