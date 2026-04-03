const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'rp_number, order_number, status, order_id';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.orderNumber) {
            filters.push('order_number = ${orderNumber}');
            filterParams.orderNumber = req.query.orderNumber;
        }

        if (req.query.rpNumber) {
            filters.push('rp_number = ${rpNumber}');
            filterParams.rpNumber = req.query.rpNumber;
        }

        if (req.query.shippingDateFrom) {
            filters.push('shipping_date >= ${shippingDateFrom}');
            filterParams.shippingDateFrom = req.query.shippingDateFrom;
        }

        if (req.query.shippingDateTo) {
            filters.push('shipping_date <= ${shippingDateTo}');
            filterParams.shippingDateTo = req.query.shippingDateTo;
        }

        if (req.query.isInactiveDataIncluded !== 'true') {
            filters.push("status != 'H'");
        }

        const orders = await db.any(`
            select ${field} from orders
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(orders);
    } catch (err) {
        next(err);
    }
});

router.get('/search', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'rp_number, order_number, status, order_id';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.orderNumber) {
            filters.push('order_number like any (to_array(${orderNumber}))');
            filterParams.orderNumber = req.query.orderNumber;
        }

        if (req.query.rpNumber) {
            filters.push('rp_number like any (to_array(${rpNumber}))');
            filterParams.rpNumber = req.query.rpNumber;
        }

        if (req.query.shippingDateFrom) {
            filters.push('shipping_date >= ${shippingDateFrom}');
            filterParams.shippingDateFrom = req.query.shippingDateFrom;
        }

        if (req.query.shippingDateTo) {
            filters.push('shipping_date <= ${shippingDateTo}');
            filterParams.shippingDateTo = req.query.shippingDateTo;
        }

        if (req.query.productCode) {
            filters.push('product_code like any (to_array(${productCode}))');
            filterParams.productCode = req.query.productCode;
        }

        if (req.query.productName) {
            filters.push('product_name like any (to_array(${productName}))');
            filterParams.productName = req.query.productName;
        }

        if (req.query.isInactiveDataIncluded !== 'true') {
            filters.push("status != 'H'");
        }

        const orders = await db.any(`
            select ${field} from orders
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(orders);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
