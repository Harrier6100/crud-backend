const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'machine_code';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.machineCode) {
            filters.push('machine_code = ${machineCode}');
            filterParams.machineCode = req.query.machineCode;
        }

        if (req.query.isInactiveDataIncluded !== 'true') {
            filters.push("status != 'D'");
        }

        const machines = await db.any(`
            select ${field} from machines
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(machines);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
