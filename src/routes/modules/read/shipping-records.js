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

        if (req.query.recordId) {
            filters.push('record_id = ${recordId}');
            filterParams.recordId = req.query.recordId;
        }

        if (req.query.planId) {
            filters.push('plan_id = ${planId}');
            filterParams.planId = req.query.planId;
        }

        if (req.query.locationCode) {
            filters.push('location_code = ${locationCode}');
            filterParams.locationCode = req.query.locationCode;
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
            filters.push("status = '1'")
        }

        const shippingRecords = await db.any(`
            select ${field} from shipping_records
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(shippingRecords);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
