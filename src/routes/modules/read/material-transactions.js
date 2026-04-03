const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*, sum(transaction_net_qty) over (partition by barcode_lot order by transaction_id) as transaction_net_qty';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'transaction_id';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.materialCode) {
            filters.push('material_code = ${materialCode}');
            filterParams.materialCode = req.query.materialCode;
        }

        if (req.query.stockLot) {
            filters.push('stock_lot = ${stockLot}');
            filterParams.stockLot = req.query.stockLot;
        }

        if (req.query.transactionDateFrom) {
            filters.push('transaction_date >= ${transactionDateFrom}');
            filterParams.transactionDateFrom = req.query.transactionDateFrom;
        }

        if (req.query.transactionDateTo) {
            filters.push('transaction_date <= ${transactionDateTo}');
            filterParams.transactionDateTo = req.query.transactionDateTo;
        }

        if (req.query.transactionType) {
            filters.push('transaction_type = ${transactionType}');
            filterParams.transactionType = req.query.transactionType;
        }

        if (req.query.machineCode) {
            filters.push('machine_code = ${machineCode}');
            filterParams.machineCode = req.query.machineCode;
        }

        if (req.query.isMoveDataIncluded !== 'true') {
            filters.push("transaction_type != '2'");
        }

        const materialTransactions = await db.any(`
            select ${field} from material_transactions
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(materialTransactions);
    } catch (err) {
        next(err);
    }
});

router.get('/search', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*, sum(transaction_net_qty) over (partition by barcode_lot order by transaction_id) as transaction_net_qty';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'transaction_id';

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

        if (req.query.stockLot) {
            filters.push('stock_lot like any (to_array(${stockLot}))');
            filterParams.stockLot = req.query.stockLot;
        }

        if (req.query.transactionDateFrom) {
            filters.push('transaction_date >= ${transactionDateFrom}');
            filterParams.transactionDateFrom = req.query.transactionDateFrom;
        }

        if (req.query.transactionDateTo) {
            filters.push('transaction_date <= ${transactionDateTo}');
            filterParams.transactionDateTo = req.query.transactionDateTo;
        }

        if (req.query.transactionType) {
            filters.push('transaction_type = ${transactionType}');
            filterParams.transactionType = req.query.transactionType;
        }

        if (req.query.machineCode) {
            filters.push('machine_code like any (to_array(${machineCode}))');
            filterParams.machineCode = req.query.machineCode;
        }

        if (req.query.planNumber) {
            filters.push('plan_number like any (to_array(${planNumber}))');
            filterParams.planNumber = req.query.planNumber;
        }

        if (req.query.processCode) {
            filters.push('process_code like any (to_array(${processCode}))');
            filterParams.processCode = req.query.processCode;
        }

        if (req.query.processLot) {
            filters.push('process_lot like any (to_array(${processLot}))');
            filterParams.processLot = req.query.processLot;
        }

        if (req.query.systemDateFrom) {
            filters.push('system_date >= ${systemDateFrom}');
            filterParams.systemDateFrom = req.query.systemDateFrom;
        }

        if (req.query.systemDateTo) {
            filters.push('system_date <= ${systemDateTo}');
            filterParams.systemDateTo = req.query.systemDateTo;
        }

        if (req.query.wsName) {
            filters.push('ws_name like any (to_array(${wsName}))');
            filterParams.wsName = req.query.wsName;
        }

        if (req.query.isMoveDataIncluded !== 'true') {
            filters.push("transaction_type != '2'");
        }

        const materialTransactions = await db.any(`
            select ${field} from material_transactions
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(materialTransactions);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
