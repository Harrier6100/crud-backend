const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'category_code';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.categoryCode) {
            filters.push('category_code = ${categoryCode}');
            filterParams.categoryCode = req.query.categoryCode;
        }

        const materialCategories = await db.any(`
            select ${field} from material_categories
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(materialCategories);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
