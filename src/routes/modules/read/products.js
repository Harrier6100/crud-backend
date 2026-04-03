const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'product_code';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.productCode) {
            filters.push('product_code = ${productCode}');
            filterParams.productCode = req.query.productCode;
        }

        if (req.query.code) {
            filters.push('product_code = ${code}');
            filterParams.code = req.query.code;
        }

        const products = await db.any(`
            select ${field} from products
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(products);
    } catch (err) {
        next(err);
    }
});

router.get('/search', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'product_code';

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

        const products = await db.any(`
            select ${field} from products
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(products);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
