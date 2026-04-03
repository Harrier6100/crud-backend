const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'product_code, barcode_lot';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.productCode) {
            filters.push('product_code = ${productCode}');
            filterParams.productCode = req.query.productCode;
        }

        if (req.query.stockLot) {
            filters.push('stock_lot = ${stockLot}');
            filterParams.stockLot = req.query.stockLot;
        }

        if (req.query.isOutOfStockIncluded !== 'true') {
            filters.push('stock_qty != 0');
        }

        const wiproductStocks = await db.any(`
            select ${field} from wiproduct_stocks
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        res.status(200).json(wiproductStocks);
    } catch (err) {
        next(err);
    }
});

router.get('/search', async (req, res, next) => {
    try {
        const field = req.query.field ? snakecase(req.query.field) : '*';
        const sort = req.query.sort ? snakecase(req.query.sort) : 'product_code, barcode_lot';

        const filters = ['1=1'];
        const filterParams = {};

        if (req.query.productCode) {
            filters.push('product_code like any (to_array(${productCode}))');
            filterParams.productCode = req.query.productCode;
        }

        if (req.query.productName) {
            filters.push('product_name like any (to_array(${productName}))');
            filterParams.productName = req.query.productName;
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

        if (req.query.stockType) {
            filters.push('stock_type like any (to_array(${stockType}))');
            filterParams.stockType = req.query.stockType;
        }

        if (req.query.stockStatus) {
            filters.push('stock_status like any (to_array(${stockStatus}))');
            filterParams.stockStatus = req.query.stockStatus;
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
            filters.push('stock_qty != 0');
        }

        const wiproductStocks = await db.any(`
            select ${field} from wiproduct_stocks
            where ${filters.join(' and ')}
            order by ${sort}
        `, filterParams);

        for (const index in wiproductStocks) {
            const wiproductStock = wiproductStocks[index];

            const { productCode } = wiproductStock;

            const physpropSpec = await db.oneOrNone(`
                select * from physprop_specs_kn
                where product_code = concat(translate(left(\${productCode}, 1), '56789', '01234'), substr(\${productCode}, 2, 8))
                    and property_code = 'A_ZD__'
                    and customer_code = ''
            `, { productCode });

            let expiryDate = '';
            if (physpropSpec) {
                expiryDate = dayjs(wiproductStock.coatingDate).add(physpropSpec.propertySpec3, 'M').format('YYYYMMDD');
            }
            wiproductStock.expiryDate = expiryDate;

            wiproductStocks[index] = wiproductStock;
        }

        res.status(200).json(wiproductStocks);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
