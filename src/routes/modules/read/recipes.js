const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : `
            product_code,
            process_type,
            case material_type when 'A' then 1 else 2 end,
            case material_type when 'B' then 1 else 2 end,
            case material_type when 'G' then 1 else 2 end,
            case material_type when 'H' then 1 else 2 end,
            case material_type when 'F' then 1 else 2 end,
            sequence_number
        `;

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

        if (req.query.materialCode) {
            filters.push('material_code = ${materialCode}');
            filterParams.materialCode = req.query.materialCode;
        }

        if (req.query.machineCode) {
            filters.push('machine_code = ${machineCode}');
            filterParams.machineCode = req.query.machineCode;
        }

        const recipes = await db.any(`
            select ${field} from recipes
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(recipes);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
