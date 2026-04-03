const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'order_number';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.orderNumber) {
            filters.push('order_number = ${orderNumber}');
            filterParams.orderNumber = req.query.orderNumber;
        }

        if (req.query.productCode) {
            filters.push('product_code = ${productCode}');
            filterParams.productCode = req.query.productCode;
        }

        const productionOrders = await db.any(`
            select ${field} from production_orders
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(productionOrders);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
