const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'material_code';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.materialCode) {
            filters.push('material_code = ${materialCode}');
            filterParams.materialCode = req.query.materialCode;
        }

        if (req.query.code) {
            filters.push('material_code = ${code}');
            filterParams.code = req.query.code;
        }

        const materials = await db.any(`
            select ${field} from materials
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(materials);
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

        if (req.query.materialCode) {
            filters.push('material_code like any (to_array(${materialCode}))');
            filterParams.materialCode = req.query.materialCode;
        }

        if (req.query.materialName) {
            filters.push('material_name like any (to_array(${materialName}))');
            filterParams.materialName = req.query.materialName;
        }

        const materials = await db.any(`
            select ${field} from materials
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(materials);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
