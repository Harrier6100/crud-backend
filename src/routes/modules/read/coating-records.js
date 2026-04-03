const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'record_id, record_type, record_line_id';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.recordId) {
            filters.push('record_id = ${recordId}');
            filterParams.recordId = req.query.recordId;
        }

        if (req.query.machineCode) {
            filters.push('machine_code = ${machineCode}');
            filterParams.machineCode = req.query.machineCode;
        }

        if (req.query.productCode) {
            filters.push('product_code = ${productCode}');
            filterParams.productCode = req.query.productCode;
        }

        if (req.query.coatingLot) {
            filters.push('coating_lot = ${coatingLot}');
            filterParams.coatingLot = req.query.coatingLot;
        }

        if (req.query.coatingDateFrom) {
            filters.push('coating_date >= ${coatingDateFrom}');
            filterParams.coatingDateFrom = req.query.coatingDateFrom;
        }

        if (req.query.coatingDateTo) {
            filters.push('coating_date <= ${coatingDateTo}');
            filterParams.coatingDateTo = req.query.coatingDateTo;
        }

        const coatingRecords = await db.any(`
            select ${field} from coating_records_sub
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(coatingRecords);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
