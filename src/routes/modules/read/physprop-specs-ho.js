const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'product_code, test_code';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.productCode) {
            filters.push('product_code = ${productCode}');
            filterParams.productCode = req.query.productCode;
        }

        if (req.query.testCode) {
            filters.push('test_code = ${testCode}');
            filterParams.testCode = req.query.testCode;
        }

        if (req.query.isCustomerSpecIncluded !== 'true') {
            filters.push("customer_code = ''");
        }

        const physpropSpecs = await db.any(`
            select ${field} from physprop_specs_ho
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(physpropSpecs);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
