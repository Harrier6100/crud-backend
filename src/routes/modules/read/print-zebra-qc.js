const express = require('express');
const router = express.Router();
const iconv = require('iconv-lite');
const { spawn } = require('child_process');
const db = require('@/db');

router.post('/typea', async (req, res, next) => {
    try {
        const { coatingLot, coatingDateFrom, coatingDateTo, machineCode, printQty = 1 } = req.body;

        const filters = ['1=1'];
        const filterData = {};

        if (coatingLot) {
            filters.push('coating_lot in (${coatingLot:csv})');
            filterData.coatingLot = coatingLot.trim().split(/\s+/);
        }

        if (coatingDateFrom) {
            filters.push('coating_date >= ${coatingDateFrom}');
            filterData.coatingDateFrom = coatingDateFrom;
        }

        if (coatingDateTo) {
            filters.push('coating_date <= ${coatingDateTo}');
            filterData.coatingDateTo = coatingDateTo;
        }

        if (machineCode && machineCode.length) {
            filters.push('machine_code in (${machineCode:csv})');
            filterData.machineCode = machineCode;
        }

        const coatingLotRecords = await db.any(`
            select product_name, coating_lot from coating_lot_records
            where ${filters.join(' and ')}
            order by coating_date, machine_code, coating_lot
        `, filterData);

        if (coatingLotRecords.length === 0) throw new HttpError('PRINT_DATA_IS_NONE', 404);

        for (const { productName, coatingLot } of coatingLotRecords) {
            let command = '';
            for (let p=0; p<printQty; p++) {
                command += `
                    ^XA
                    ^MUM,300,300
                    ^CWJ,B:GOTHIC.FNT
                    ^SEB:JIS.DAT
                    ^PR2,8,8
                    ^LH0,0
                    ^PON
                    ^BY0.2,3,1
                    ^PQ1
                    ^FS
                    ^CI15
                    ^FO8,5^AJ,3,3^FH^FD_${encode(productName.slice(productName.indexOf(' ') + 1))}^FS
                    ^FO8,9^AJ,3,3^FH^FD_${encode(coatingLot)}^FS
                    ^FO8,12^BC,5,N,N,N^FD_${coatingLot}^FS
                    ^FO48,5^AJ,3,3^FH^FD_${encode(productName.slice(productName.indexOf(' ') + 1))}^FS
                    ^FO48,9^AJ,3,3^FH^FD_${encode(coatingLot)}^FS
                    ^FO48,12^BC,5,N,N,N^FD_${coatingLot}^FS
                    ^XZ
                    ^XA
                    ^MUM,300,300
                    ^CWJ,B:GOTHIC.FNT
                    ^SEB:JIS.DAT
                    ^PR2,8,8
                    ^LH0,0
                    ^PON
                    ^BY0.2,3,1
                    ^PQ1
                    ^FS
                    ^CI15
                    ^FO8,5^AJ,3,3^FH^FD_${encode(productName.slice(productName.indexOf(' ') + 1))}^FS
                    ^FO8,9^AJ,3,3^FH^FD_${encode(coatingLot)}^FS
                    ^FO8,12^BC,5,N,N,N^FD_${coatingLot}^FS
                    ^FO48,5^AJ,3,3^FH^FD_${encode(productName.slice(productName.indexOf(' ') + 1))}^FS
                    ^FO48,9^AJ,3,3^FH^FD_${encode(coatingLot)}^FS
                    ^FO48,12^BC,5,N,N,N^FD_${coatingLot}^FS
                    ^XZ
                `;
            }

            await print(command);
        }

        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
});

router.post('/typeb', async (req, res, next) => {
    try {
        const { coatingLot, coatingDateFrom, coatingDateTo, machineCode, printQty = 1 } = req.body;

        const filters = ['1=1'];
        const filterData = {};

        if (coatingLot) {
            filters.push('coating_lot in (${coatingLot:csv})');
            filterData.coatingLot = coatingLot.trim().split(/\s+/);
        }

        if (coatingDateFrom) {
            filters.push('coating_date >= ${coatingDateFrom}');
            filterData.coatingDateFrom = coatingDateFrom;
        }

        if (coatingDateTo) {
            filters.push('coating_date <= ${coatingDateTo}');
            filterData.coatingDateTo = coatingDateTo;
        }

        if (machineCode && machineCode.length) {
            filters.push('machine_code in (${machineCode:csv})');
            filterData.machineCode = machineCode;
        }

        const coatingLotRecords = await db.any(`
            select product_name, coating_lot from coating_lot_records
            where ${filters.join(' and ')}
            order by coating_date, machine_code, coating_lot
        `, filterData);

        if (coatingLotRecords.length === 0) throw new HttpError('PRINT_DATA_IS_NONE', 404);

        for (const { productName, coatingLot } of coatingLotRecords) {
            let command = '';
            for (let p=0; p<printQty; p++) {
                command += `
                    ^XA
                    ^MUM,300,300
                    ^CWJ,B:GOTHIC.FNT
                    ^SEB:JIS.DAT
                    ^PR2,8,8
                    ^LH0,0
                    ^PON
                    ^BY0.2,3,1
                    ^PQ1
                    ^FS
                    ^CI15
                    ^FO10,5^AJ,5,4^FH^FD_${encode(productName)}^FS
                    ^FO10,12^AJ,5,4^FH^FD_${encode(coatingLot)}^FS
                    ^FO40,11^BC,6,N,N,N^FD_${coatingLot}^FS
                    ^XZ
                `;
                if (printQty > 1 && printQty == (p + 1)) {
                    command += `
                        ^XA
                        ^MUM,300,300
                        ^CWJ,B:GOTHIC.FNT
                        ^SEB:JIS.DAT
                        ^PR2,8,8
                        ^LH0,0
                        ^PON
                        ^BY0.2,3,8
                        ^PQ1
                        ^FS
                        ^CI15
                        ^FO39,6^A0,12,9^FDDS^FS
                        ^XZ
                    `;
                }
            }

            await print(command);
        }

        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
});

router.post('/typec', async (req, res, next) => {
    try {
        const { text, fontSize = 10, positionX = 10, positionY = 7, printQty = 1 } = req.body;

        let command = '';
        for (let p=0; p<printQty; p++) {
            command += `
                ^XA
                ^MUM,300,300
                ^CWJ,B:GOTHIC.FNT
                ^SEB:JIS.DAT
                ^PR2,8,8
                ^LH0,0
                ^PON
                ^BY0.2,3,8
                ^PQ1
                ^FS
                ^CI15
                ^FO${positionX},${positionY}
                ^AJ,${fontSize},${fontSize}
                ^FH^FD_${encode(text)}^FS
                ^XZ
            `;
        }
        await print(command);

        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
});

router.post('/typed', async (req, res, next) => {
    try {
        const { text, printQty = 1 } = req.body;

        const texts = new Array(4).fill('');
        for (const index in texts) {
            if (text[index]) {
                texts[index] = text[index];
            }
        }

        let command = '';
        for (let p=0; p<printQty; p++) {
            command += `
                ^XA
                ^MUM,300,300
                ^CWJ,B:GOTHIC.FNT
                ^SEB:JIS.DAT
                ^PR2,8,8
                ^LH0,0
                ^PON
                ^BY0.2,3,8
                ^PQ1
                ^FS
                ^CI15
                ^FO10,4^AJ,3,3^FH^FD_${encode(texts[0])}^FS
                ^FO10,8^AJ,3,3^FH^FD_${encode(texts[1])}^FS
                ^FO10,12^AJ,3,3^FH^FD_${encode(texts[2])}^FS
                ^FO10,16^AJ,3,3^FH^FD_${encode(texts[3])}^FS
                ^XZ
            `;
        }
        await print(command);

        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
});

router.post('/qr', async (req, res, next) => {
    try {
        const { data, printQty = 1 } = req.body;

        for (const row of data.slice(0, 3)) {
            const { productName, coatingLot, testName, propertyName, hum, testDate, testType, remarks } = row;

            const { productCode } = await db.oneOrNone(`
                select product_code from coating_lot_records
                where coating_lot = \${coatingLot}
            `, { coatingLot });

            const { testCode, propertyCode } = await db.oneOrNone(`
                select * from physprop_specs_kn
                where product_code = codec(\${productCode})
                    and test_name ~* ('^' || \${propertyName})
                    and customer_code = ''
            `, { productCode, propertyName });

            if (testCode) {
                let command = '';
                for (let p=0; p<printQty; p++) {
                    if (testType === 'NENCHAKU') {
                        command += `
                            ^XA
                            ^MUM,300,300
                            ^CWJ,B:HOTHIC.FNT
                            ^SEB:JIS.DAT
                            ^PR2,8,8
                            ^LH0,0
                            ^PON
                            ^BY0.2,3,1
                            ^PQ1
                            ^FS
                            ^CI15
                            ^MUD,300,300
                            ^FO740,20^BQN,2,4^FH^FDLA,_09_09_09_09_${encode('[end]')}_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08${productName}_20_${encode('[' + propertyCode + ']')}_09_${encode('[end]')}_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08${coatingLot}_09_09_09_09_09_09_09_09_09_09_09_${encode('[end]')}_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08${productCode}_09_${encode('[end]')}_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_08_${encode(testCode)}_09_09_09^FS
                            ^MUM,300,300
                            ^FO09,4^AJ,3,3^FH^FD_${encode(productName)}^FS
                            ^FO09,7^AJ,3,3^FH^FD_${encode(coatingLot)}^FS
                            ^FO09,10^AJ,3,3^FH^FD_${encode(testName)}^FS
                            ^FO09,13^AJ,3,3^FH^FD_${encode(testCode)}^FS
                            ^FO09,17^AJ,3,3^FH^FD_${encode(remarks.slice(0, 18))}^FS
                            ^XZ
                        `;
                    }
                }

                await print(command);
            }
        }

        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
});

const encode = (str) => {
    if (!str) return '';
    return Buffer.from(iconv.encode(str, 'sjis')).toString('hex').match(/.{2}/g).join('_');
};

const print = (data) => {
    return new Promise((resolve, reject) => {
        // const lpr = spawn('lpr', ['-P', '192.168.14.80']);
        const lpr = spawn('lpr', ['-P', '192.168.19.61']);

        lpr.on('error', reject);
        lpr.on('close', (code) => code === 0 ? resolve() : reject(new Error('PRINTER_FAILED')));
        lpr.stdin.end(data);
    });
};

module.exports = router;
