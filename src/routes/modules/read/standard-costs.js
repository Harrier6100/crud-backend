const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'factory_code, period, product_code, machine_code, process_type, category';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.factoryCode) {
            filters.push('factory_code = ${factoryCode}');
            filterParams.factoryCode = req.query.factoryCode;
        }

        if (req.query.period) {
            filters.push('period = ${period}');
            filterParams.period = req.query.period;
        }

        if (req.query.productCode) {
            filters.push('product_code = ${productCode}');
            filterParams.productCode = req.query.productCode;
        }

        if (req.query.machineCode) {
            filters.push('machine_code = ${machineCode}');
            filterParams.machineCode = req.query.machineCode;
        }

        if (req.query.category) {
            filters.push('category = ${category}');
            filterParams.category = req.query.category;
        }

        const standardCosts = await db.any(`
            select ${field} from standard_costs
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(standardCosts);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
