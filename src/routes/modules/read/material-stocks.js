const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'material_code, barcode_lot';

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

        if (req.query.warehouseCode) {
            filters.push('warehouse_code = ${warehouseCode}');
            filterParams.warehouseCode = req.query.warehouseCode;
        }

        if (req.query.purchaseId) {
            filters.push('purchase_id = ${purchaseId}');
            filterParams.purchaseId = req.query.purchaseId;
        }

        if (req.query.isOutOfStockIncluded !== 'true') {
            filters.push('stock_qty != 0');
        }

        const materialStocks = await db.any(`
            select ${field} from material_stocks
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(materialStocks);
    } catch (err) {
        next(err);
    }
});

router.get('/search', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'material_code, barcode_lot';

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

        if (req.query.stockWidth) {
            filters.push('stock_width = ${stockWidth}');
            filterParams.stockWidth = req.query.stockWidth;
        }

        if (req.query.stockLength) {
            filters.push('stock_length = ${stockLength}');
            filterParams.stockLength = req.query.stockLength;
        }

        if (req.query.warehouseCode) {
            filters.push('warehouse_code like any (to_array(${warehouseCode}))');
            filterParams.warehouseCode = req.query.warehouseCode;
        }

        if (req.query.stockStatus) {
            filters.push('stock_status like any (to_array(${stockStatus}))');
            filterParams.stockStatus = req.query.stockStatus;
        }

        if (req.query.purchaseId) {
            filters.push('purchase_id like any (to_array(${purchaseId}))');
            filterParams.purchaseId = req.query.purchaseId;
        }

        if (req.query.receiveDateFrom) {
            filters.push('receive_date >= ${receiveDateFrom}');
            filterParams.receiveDateFrom = req.query.receiveDateFrom;
        }

        if (req.query.receiveDateTo) {
            filters.push('receive_date <= ${receiveDateTo}');
            filterParams.receiveDateTo = req.query.receiveDateTo;
        }

        if (req.query.isOutOfStockIncluded !== 'true') {
            filters.push('stock_qty > 0');
        }

        const materialStocks = await db.any(`
            select ${field} from material_stocks
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(materialStocks);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
