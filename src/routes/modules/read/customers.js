const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'customer_code';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.customerCode) {
            filters.push('customer_code = ${customerCode}');
            filterParams.customerCode = req.query.customerCode;
        }

        const customers = await db.any(`
            select ${field} from customers
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(customers);
    } catch (err) {
        next(err);
    }
});

router.get('/search', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'customer_code';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.customerCode) {
            filters.push('customer_code like any (to_array(${customerCode}))');
            filterParams.customerCode = req.query.customerCode;
        }

        if (req.query.customerName) {
            filters.push('customer_name like any (to_array(${customerName}))');
            filterParams.customerName = req.query.customerName;
        }

        const customers = await db.any(`
            select ${field} from customers
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(customers);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
