const express = require('express');
const router = express.Router();
const fs = require('fs');
const snakecase = require('@/helpers/snakecase');
const jobexec = require('@/helpers/jobexec');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'product_code, machine_code';

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

        if (req.query.machineCode) {
            filters.push('machine_code = ${machineCode}');
            filterParams.machineCode = req.query.machineCode;
        }

        if (req.query.machine_code) {
            filters.push('machine_code = ${machine_code}');
            filterParams.machine_code = req.query.machine_code;
        }

        const coatingStandards = await db.any(`
            select ${field} from coating_standards
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(coatingStandards);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const {
            factoryCode,
            productCode,
            machineCode,
            coatingSpeed,
        } = req.body;

        const text = [
            factoryCode,
            productCode,
            factoryCode + machineCode,
            coatingSpeed ? coatingSpeed : 0
        ].join('\t') + '\n';

        fs.appendFileSync(`/srv/ftp/AFTKJRCV.TXT`, text);
        await jobexec('AFTKJRCV', `DATA(AFTKJRCV.TXT)`);

        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
