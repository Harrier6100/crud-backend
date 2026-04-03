const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'supplier_code';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.supplierCode) {
            filters.push('supplier_code = ${supplierCode}');
            filterParams.supplierCode = req.query.supplierCode;
        }

        const suppliers = await db.any(`
            select ${field} from suppliers
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(suppliers);
    } catch (err) {
        next(err);
    }
});

router.get('/search', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'supplier_code';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.supplierCode) {
            filters.push('supplier_code like any (to_array(${supplierCode}))');
            filterParams.supplierCode = req.query.supplierCode;
        }

        if (req.query.supplierName) {
            filters.push('supplier_name like any (to_array(${supplierName}))');
            filterParams.supplierName = req.query.supplierName;
        }

        const suppliers = await db.any(`
            select ${field} from suppliers
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(suppliers);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
