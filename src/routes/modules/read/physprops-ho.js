const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'property_code, factory_code';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.propertyCode) {
            filters.push('property_code = ${propertyCode}');
            filterParams.propertyCode = req.query.propertyCode;
        }

        const physprops = await db.any(`
            select ${field} from physprops_ho
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(physprops);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
