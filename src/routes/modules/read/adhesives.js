const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'adhesive_code, sequence_number';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.adhesiveCode) {
            filters.push('adhesive_code = ${adhesiveCode}');
            filterParams.adhesiveCode = req.query.adhesiveCode;
        }

        if (req.query.materialCode) {
            filters.push('material_code = ${materialCode}');
            filterParams.materialCode = req.query.materialCode;
        }

        if (req.query.isInactiveDataIncluded !== 'true') {
            filters.push("status != 'D'");
        }

        const adhesives = await db.any(`
            select ${field} from adhesives
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(adhesives);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
