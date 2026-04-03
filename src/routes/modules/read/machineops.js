const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

const getMachineName = (machineCode) => {
    switch (machineCode) {
        case 'KNA2': return 'ac2'
        case 'KNR1': return 'ar1'
        case 'KNS7': return 'as7'
        case 'KNS8': return 'as8'
        case 'KNS9': return 'as9'
        case 'KN9A': return 'as9a'
        case 'KN9B': return 'as9b'
        case 'KNS0': return 'as10'
        case 'KNSB': return 'as11'
        case 'KNS2': return 'as12'
        case 'KNC2': return 'as22'
        case 'KNC1': return 'as23'
        case 'KNC4': return 'as24'
        case 'KNC5': return 'as25'
    }
};

router.get('/:machineCode', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'id';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.lot) {
            filters.push('lot = ${lot}');
            filterParams.lot = req.query.lot;
        }

        if (req.query.startId) {
            filters.push('id >= ${startId}');
            filterParams.startId = req.query.startId;
        }

        if (req.query.startAt) {
            filters.push('id >= ${startAt}');
            filterParams.startAt = req.query.startAt;
        }

        if (req.query.endId) {
            filters.push('id <= ${endId}');
            filterParams.endId = req.query.endId;
        }

        if (req.query.endAt) {
            filters.push('id <= ${endAt}');
            filterParams.endAt = req.query.endAt;
        }

        const machineOps = await db.any(`
            select ${field} from machine_op_${getMachineName(req.params.machineCode)}
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(machineOps);
    } catch (err) {
        next(err);
    }
});

router.get('/:machineCode/columns', async (req, res, next) => {
    try {
        const columns = await db.any(`
            select column_name from information_schema.columns
            where table_schema = 'public'
                and table_name = 'machine_op_${getMachineName(req.params.machineCode)}'
        `);

        res.status(200).json(columns);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
