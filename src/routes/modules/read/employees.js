const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'employee_code';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.employeeCode) {
            filters.push('employee_code = ${employeeCode}');
            filterParams.employeeCode = req.query.employeeCode;
        }

        const employees = await db.any(`
            select ${field} from employees
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(employees);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
