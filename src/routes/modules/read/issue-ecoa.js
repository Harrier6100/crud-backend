const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');
const xml2js = require('xml2js');
const db = require('@/db');

const IMPORT_PATH_ST = '/mnt/ecoa/import/st';
const IMPORT_PATH_BOSCH = '/mnt/ecoa/import/bosch';
const IMPORT_PATH_TI = '/mnt/ecoa/import/ti';
const EXPORT_PATH_ST = '/mnt/ecoa/export/st';
const EXPORT_PATH_BOSCH = '/mnt/ecoa/export/bosch';
const EXPORT_PATH_TI = '/mnt/ecoa/export/ti';

router.post('/st', async (req, res, next) => {
    try {
        const { rpNumber } = req.body;
        const { factoryCode, order, shippings } = await getBaseData(rpNumber);

        const { config, json } = await getConfigAndJson(IMPORT_PATH_ST, conf =>
            conf.productCode === order.productCode
            && conf.partsNumber === order.partsNumber
            && conf.customerCode === order.customerCode
        );

        for (const shipping of shippings) {
            const { coatingLotRecord, physpropSpec, compressLot } = await getMainData(shipping);

            const root = Object.values(json)[0];
            root.$.ShipmentDate = dayjs(order.shippingDate).format('DD-MMM-YYYY');
            root.$.ShipmentNumber = order.shippingDate + rpNumber + compressLot;
            root.$.ShipmentQty = shipping.shippingQty;
            root.Lot.$.ShipLotNo = compressLot;
            root.Lot.$.ExpiryDate = dayjs(coatingLotRecord.coatingDate).add(physpropSpec.specValue3, 'months').format('DD-MMM-YYYY');
            root.Lot.$.MfgDate = dayjs(coatingLotRecord.coatingDate).format('DD-MMM-YYYY');
            root.Lot.$.LotQty = 1;
            if (factoryCode === 'MU' && root.SYMBOLICS) {
                if (root.SYMBOLICS.SYM_Sheet_Quantity_Per_Roll) {
                    root.SYMBOLICS.SYM_Sheet_Quantity_Per_Roll.$.VALUE = shipping.shippingPcsQty;
                }
            }

            for (const property in root.Lot) {
                if (property === '$') continue;
                const testLot = shipping.parentLot;
                const testCode = config.properties[property].testCode;
                const transform = config.properties[property].transform;
                const physpropValue = await fetchPhyspropValue(testLot, testCode);
                const propertyValue = calculation(transform, physpropValue);

                root.Lot[property].$.N = propertyValue.n;
                root.Lot[property].$.MEAN = propertyValue.mean;
                root.Lot[property].$.MAX = propertyValue.max;
                root.Lot[property].$.MIN = propertyValue.min;
                root.Lot[property].$.SD = propertyValue.sd;
            }

            const builder = new xml2js.Builder({ xmldec: { version: '1.0', encoding: 'utf-8' }});
            const xml = builder.buildObject(json);

            const filename = `TEST_${rpNumber}_${compressLot}.xml`;
            fs.writeFileSync(path.join(EXPORT_PATH_ST, filename), xml);
        }

        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
});

router.post('/bosch', async (req, res, next) => {
    try {
        const { rpNumber } = req.body;
        const { factoryCode, order, shippings } = await getBaseData(rpNumber);

        const { config, json } = await getConfigAndJson(IMPORT_PATH_BOSCH, conf =>
            conf.productCode === order.productCode
        );

        const root = Object.values(json)[0];
        const Lot = JSON.stringify(root.Lot);
        root.Lot = [];

        for (const shipping of shippings) {
            const { coatingLotRecord, physpropSpec, compressLot } = await getMainData(shipping);

            root.$.ShipmentNumber = `SN_${order.shippingDate}_${rpNumber}`;
            root.$.PONumber = `PO${order.poNumber}`;
            const $Lot = JSON.parse(Lot);
            $Lot.$.BatchID = compressLot;
            $Lot.$.ExpiryDate = dayjs(coatingLotRecord.coatingDate).add(physpropSpec.specValue3, 'months').format('YYYY-MM-DD');
            $Lot.$.ManufacturingDate = dayjs(coatingLotRecord.coatingDate).format('YYYY-MM-DD');

            for (const property in $Lot) {
                if (property === '$') continue;
                const testLot = shipping.parentLot;
                const testCode = config.properties[property].testCode;
                const transform = config.properties[property].transform;
                const physpropValue = await fetchPhyspropMeanValue(testLot, testCode);
                const propertyValue = calculation(transform, physpropValue);

                $Lot[property].RAW.$.VALUE = propertyValue.value;
            }

            root.Lot.push($Lot);
        }

        const builder = new xml2js.Builder({ xmldec: { version: '1.0', encoding: 'utf-8' }});
        const xml = builder.buildObject(json);

        const filename = `TEST_${rpNumber}.xml`;
        fs.writeFileSync(path.join(EXPORT_PATH_BOSCH, filename), xml);

        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
});

router.post('/ti', async (req, res, next) => {
    try {
        const { rpNumber } = req.body;
        const { factoryCode, order, shippings } = await getBaseData(rpNumber);

        const { config, json } = await getConfigAndJson(IMPORT_PATH_TI, conf =>
            conf.productCode === order.productCode
        );

        for (const shipping of shippings) {
            const { coatingLotRecord, physpropSpec, compressLot } = await getMainData(shipping);

            const root = Object.values(json)[0];
            root.CertificateOfAnalysis['udc:BusinessDocumentReference']['udc:DateTime'] = dayjs().format('YYYY-MM-DD');
            root.CertificateOfAnalysis['udc:BusinessDocumentReference']['udc:Identifier'] = order.shippingDate + rpNumber + compressLot;
            root.CertificateOfAnalysis.LotIdentification['dm:LotQuantity']['dm:Quantity'] = shipping.shippingQty;
            root.CertificateOfAnalysis.LotIdentification.Primary = compressLot;
            root.CertificateOfAnalysis.Material.AnalysisDate = dayjs().format('YYYY-MM-DD');
            root.CertificateOfAnalysis.Material.ManufacturedDate = dayjs(coatingLotRecord.coatingDate).format('YYYY-MM-DD');
            root.CertificateOfAnalysis.Material.Requirement.PartNumber = order.partsNumber.split('-')[0];
            root.CertificateOfAnalysis.Material.Requirement.RevisionNumber = order.partsNumber.split('-')[1];
            root.CertificateOfAnalysis.Material.Requirement.SellerProjectedExpiryDate = dayjs(coatingLotRecord.coatingDate).add(physpropSpec.specValue3, 'months').format('YYYY-MM-DD');
            root['ssdh:DocumentHeader']['ssdh:CorrelationInformation']['ssdh:ContractInformation']['ssdh:ContractIdentifier'] = order.poNumber;
            root['ssdh:DocumentHeader']['ssdh:DocumentInformation']['ssdh:Creation'] = dayjs().format('YYYY-MM-DD');
            root['ssdh:DocumentHeader']['ssdh:DocumentInformation']['ssdh:DocumentIdentification']['ssdh:Identifier'] = order.shippingDate + rpNumber + compressLot;

            for (const $Characteristic of root.CertificateOfAnalysis.Material.Characteristic) {
                const testLot = shipping.parentLot;
                const testCode = config.properties[$Characteristic.SubCode].testCode;
                const transform = config.properties[$Characteristic.SubCode].transform;
                const physpropValue = await fetchPhyspropMeanValue(testLot, testCode);
                const propertyValue = calculation(transform, physpropValue);

                $Characteristic.QualityData.Result = propertyValue.value;
            }

            const builder = new xml2js.Builder({ xmldec: { version: '1.0', encoding: 'utf-8' }});
            const xml = builder.buildObject(json);

            const filename = `TEST_${rpNumber}_${compressLot}.xml`;
            fs.writeFileSync(path.join(EXPORT_PATH_TI, filename), xml);
        }

        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
});

const getBaseData = async (rpNumber) => {
    const factoryCode = rpNumber.charAt(0) === 'R' ? 'KN' : 'MU';

    const order = await fetchOrder(factoryCode, rpNumber);
    if (!order) throw new HttpError('ORDER_NOT_FOUND', 400);

    const shippings = await fetchShippings(factoryCode, rpNumber);
    if (!shippings.length) throw new HttpError('SHIPPINGS_NOT_FOUND', 400);

    return { factoryCode, order, shippings };
};

const getMainData = async (shipping) => {
    const coatingLotRecord = await fetchCoatingLotRecord(shipping.parentLot);
    const physpropSpec = await fetchPhyspropSpec(coatingLotRecord.productCode);
    const compressLot = compress(shipping.parentLot);

    return { coatingLotRecord, physpropSpec, compressLot };
};

const fetchOrder = async (factoryCode, rpNumber) => {
    return await db.oneOrNone(`
        select * from orders
        where factory_code = \${factoryCode}
            and rp_number = \${rpNumber}
            and status != 'H'
    `, { factoryCode, rpNumber });
};

const fetchShippings = async (factoryCode, rpNumber) => {
    if (factoryCode === 'KN') {
        return await db.any(`
            select distinct
                parent_lot,
                sum(shipping_qty) over (partition by rp_number, parent_lot, shipping_date) as shipping_qty,
                0 as shipping_pcs_qty
            from shipping_lot_records
            where rp_number = \${rpNumber}
        `, { rpNumber });
    }

    if (factoryCode === 'MU') {
        return await db.any(`
            select distinct
                parent_lot,
                count(*) over (partition by rp_number, parent_lot) as shipping_qty,
                product_pcs_qty as shipping_pcs_qty
            from kensahyouirai
            where rp_number = \${rpNumber}
        `, { rpNumber });
    }
};

const fetchCoatingLotRecord = async (coatingLot) => {
    return await db.oneOrNone(`
        select * from coating_lot_records
        where coating_lot = \${coatingLot}
    `, { coatingLot });
};

const fetchPhyspropSpec = async (productCode) => {
    return await db.oneOrNone(`
        select * from physprop_specs_kn
        where product_code = codec(\${productCode})
            and property_code = 'A_ZD__'
            and customer_code = ''
    `, { productCode });
};

const fetchPhyspropValue = async (testLot, testCode) => {
    return await db.oneOrNone(`
        select distinct
            coalesce(count(*) over (partition by test_lot, test_code), 0) as n,
            coalesce(trunc(avg(property_value) over (partition by test_lot, test_code), 3), 0) as mean,
            coalesce(trunc(max(property_value) over (partition by test_lot, test_code), 3), 0) as max,
            coalesce(trunc(min(property_value) over (partition by test_lot, test_code), 3), 0) as min,
            coalesce(trunc(round(stddev_samp(property_value) over (partition by test_lot, test_code), 2), 2), 0) as sd,
            coalesce(trunc(round(stddev_samp(property_value_mn) over (partition by test_lot, test_code), 2), 2), 0) as sd_mn
        from physprop_values_kn
        where test_lot = substr(\${testLot}, 1, 9)
            and test_code = \${testCode}
            and test_number != '091'
    `, { testLot, testCode });
};

const fetchPhyspropMeanValue = async (testLot, testCode) => {
    return await db.oneOrNone(`
        select
            property_value as value,
            property_value_mn as value_mn
        from physprop_values_kn
        where test_lot = \${testLot}
            and test_code = \${testCode}
            and test_number = '091'
    `, { testLot, testCode });
};

const getConfigAndJson = async (importPath, finder) => {
    const configFile = path.join(importPath, 'config.json');
    const configs = JSON.parse(fs.readFileSync(configFile));
    const config = configs.find(finder);
    if (!config) throw new HttpError('CONFIG_NOT_FOUND', 400);

    const templateFile = path.join(importPath, config.template);
    const template = fs.readFileSync(templateFile);

    const parser = new xml2js.Parser({ explicitArray: false });
    const json = await parser.parseStringPromise(template);

    return { config, json };
};

const compress = (str) => {
    const strings = '1234567890ABCDEFGHIJKLMNOPQRSTU';

    const strs = new Array(6);
    strs[0] = str.substr(0, 1); // 年
    strs[1] = str.substr(1, 2); // 月
    strs[2] = str.substr(3, 2); // 日
    strs[3] = str.substr(7, 2); // 機械
    strs[4] = str.substr(5, 2); // 連番
    strs[5] = str.substr(9, 1); // 枝番

    // 年月
    strs[1] = strings.substr((Number(strs[1]) - 1), 1);
    strs[2] = strings.substr((Number(strs[2]) - 1), 1);

    // 機械
    if (strs[3] === '30') strs[3] = '0';
    if (strs[3] === '37') strs[3] = '7';
    if (strs[3] === '40') strs[3] = 'E';

    // 枝番
    if (strs[5] === '') strs[5] = '0';

    return strs.join('');
};

const calculation = (transform, values) => {
    const result = {};

    for (const [key, exp] of Object.entries(transform)) {
        const fn = new Function(...Object.keys(values), `return ${exp}`);
        result[key] = fn(...Object.values(values));
    }

    return result;
};

module.exports = router;
