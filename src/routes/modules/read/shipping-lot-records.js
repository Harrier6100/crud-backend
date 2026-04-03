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

        if (req.query.productCode) {
            filters.push('product_code = ${productCode}');
            filterParams.productCode = req.query.productCode;
        }

        if (req.query.productLot) {
            filters.push('product_lot = ${productLot}');
            filterParams.productLot = req.query.productLot;
        }

        if (req.query.parentLot) {
            filters.push('parent_lot = ${parentLot}');
            filterParams.parentLot = req.query.parentLot;
        }

        if (req.query.isInactiveDataIncluded !== 'true') {
            filters.push("status != '9'");
        }

        const shippingLotRecords = await db.any(`
            select ${field} from shipping_lot_records
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(shippingLotRecords);
    } catch (err) {
        next(err);
    }
});

router.get('/search', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'plan_id';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.shippingDateFrom) {
            filters.push('shipping_date >= ${shippingDateFrom}');
            filterParams.shippingDateFrom = req.query.shippingDateFrom;
        }

        if (req.query.shippingDateTo) {
            filters.push('shipping_date <= ${shippingDateTo}');
            filterParams.shippingDateTo = req.query.shippingDateTo;
        }

        if (req.query.rpNumber) {
            filters.push('rp_number like any (to_array(${rpNumber}))');
            filterParams.rpNumber = req.query.rpNumber;
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
            filters.push('product_code like any (to_array(${productCode}))');
            filterParams.productCode = req.query.productCode;
        }

        if (req.query.productName) {
            filters.push('product_name like any (to_array(${productName}))');
            filterParams.productName = req.query.productName;
        }

        if (req.query.productLot) {
            filters.push('product_lot like any (to_array(${productLot}))');
            filterParams.productLot = req.query.productLot;
        }

        if (req.query.shipToCode) {
            filters.push('ship_to_code like any (to_array(${shipToCode}))');
            filterParams.shipToCode = req.query.shipToCode;
        }

        if (req.query.shipToName) {
            filters.push('ship_to_name like any (to_array(${shipToName}))');
            filterParams.shipToName = req.query.shipToName;
        }

        if (req.query.customerCode) {
            filters.push('customer_code like any (to_array(${customerCode}))');
            filterParams.customerCode = req.query.customerCode;
        }

        if (req.query.customerName) {
            filters.push('customer_name like any (to_array(${customerName}))');
            filterParams.customerName = req.query.customerName;
        }

        const shippingLotRecords = await db.any(`
            select ${field} from shipping_lot_records
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(shippingLotRecords);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
