const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'stock_id';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.productCode) {
            filters.push('product_code = ${productCode}');
            filterParams.productCode = req.query.productCode;
        }

        const productStocks = await db.any(`
            select ${field} from product_stocks
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(productStocks);
    } catch (err) {
        next(err);
    }
});

router.get('/search', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'stock_id';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.productCode) {
            filters.push('product_code like any (to_array(${productCode}))');
            filterParams.productCode = req.query.productCode;
        }

        if (req.query.productName) {
            filters.push('product_name like any (to_array(${productName}))');
            filterParams.productName = req.query.productName;
        }

        if (req.query.stockWidth) {
            filters.push('stock_width = ${stockWidth}');
            filterParams.stockWidth = req.query.stockWidth;
        }

        if (req.query.stockLength) {
            filters.push('stock_length = ${stockLength}');
            filterParams.stockLength = req.query.stockLength;
        }

        if (req.query.warehouseCode) {
            filters.push('warehouse_code like any (to_array(${warehouseCode}))');
            filterParams.warehouseCode = req.query.warehouseCode;
        }

        if (req.query.printCode) {
            filters.push('print_code like any (to_array(${printCode}))');
            filterParams.printCode = req.query.printCode;
        }

        if (req.query.stockType) {
            filters.push('stock_type like any (to_array(${stockType}))');
            filterParams.stockType = req.query.stockType;
        }

        const productStocks = await db.any(`
            select ${field} from product_stocks
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(productStocks);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
