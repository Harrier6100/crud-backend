const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'coating_date, machine_code, sequence_number';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.planId) {
            filters.push('plan_id = ${planId}');
            filterParams.planId = req.query.planId;
        }

        if (req.query.planNumber) {
            filters.push('plan_id = ${planNumber}');
            filterParams.planNumber = req.query.planNumber;
        }

        if (req.query.machineCode) {
            filters.push('machine_code = ${machineCode}');
            filterParams.machineCode = req.query.machineCode;
        }

        if (req.query.coatingDateFrom) {
            filters.push('coating_date >= ${coatingDateFrom}');
            filterParams.coatingDateFrom = req.query.coatingDateFrom;
        }

        if (req.query.scheduledDateFrom) {
            filters.push('coating_date >= ${scheduledDateFrom}');
            filterParams.scheduledDateFrom = req.query.scheduledDateFrom;
        }

        if (req.query.coatingDateTo) {
            filters.push('coating_date <= ${coatingDateTo}');
            filterParams.coatingDateTo = req.query.coatingDateTo;
        }

        if (req.query.scheduledDateTo) {
            filters.push('coating_date <= ${scheduledDateTo}');
            filterParams.scheduledDateTo = req.query.scheduledDateTo;
        }

        if (req.query.period) {
            filters.push('period = ${period}');
            filterParams.period = req.query.period;
        }

        if (req.query.yearmonth) {
            filters.push('period = ${yearmonth}');
            filterParams.yearmonth = req.query.yearmonth;
        }

        if (req.query.periodWeek) {
            filters.push('period_week = ${periodWeek}');
            filterParams.periodWeek = req.query.periodWeek;
        }

        if (req.query.week) {
            filters.push('period_week = ${week}');
            filterParams.week = req.query.week;
        }

        if (req.query.productCode) {
            filters.push('product_code = ${productCode}');
            filterParams.productCode = req.query.productCode;
        }

        const coatingPlans = await db.any(`
            select ${field} from coating_plans
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        for (const index in coatingPlans) {
            const coatingPlan = coatingPlans[index];

            const { productCode, machineCode } = coatingPlan;

            const recipes = await db.any(`
                select * from recipes
                where product_code = \${productCode}
                    and machine_code = \${machineCode}
                    and material_type = 'F'
            `, { productCode, machineCode });

            coatingPlan.recipes = recipes;

            coatingPlans[index] = coatingPlan;
        }

        res.status(200).json(coatingPlans);
    } catch (err) {
        next(err);
    }
});

router.get('/search', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'coating_date, machine_code, sequence_number';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.planId) {
            filters.push('plan_id like any (to_array(${planId}))');
            filterParams.planId = req.query.planId;
        }

        if (req.query.machineCode) {
            filters.push('machine_code like any (to_array(${machineCode}))');
            filterParams.machineCode = req.query.machineCode;
        }

        if (req.query.coatingDateFrom) {
            filters.push('coating_date >= ${coatingDateFrom}');
            filterParams.coatingDateFrom = req.query.coatingDateFrom;
        }

        if (req.query.scheduledDateFrom) {
            filters.push('scheduled_date >= ${scheduledDateFrom}');
            filterParams.scheduledDateFrom = req.query.scheduledDateFrom;
        }

        if (req.query.coatingDateTo) {
            filters.push('coating_date <= ${coatingDateTo}');
            filterParams.coatingDateTo = req.query.coatingDateTo;
        }

        if (req.query.scheduledDateTo) {
            filters.push('scheduled_date <= ${scheduledDateTo}');
            filterParams.scheduledDateTo = req.query.scheduledDateTo;
        }

        if (req.query.productCode) {
            filters.push('product_code like any (to_array(${productCode}))');
            filterParams.productCode = req.query.productCode;
        }

        const coatingPlans = await db.any(`
            select ${field} from coating_plans
                where ${filters.join(' and ')}
                order by ${sort}
        `, filterParams);

        res.status(200).json(coatingPlans);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
