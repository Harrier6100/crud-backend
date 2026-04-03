const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const db = require('@/db');

router.get('/', async (req, res, next) => {
    try {
        const { productCode, coatingDateFrom, coatingDateTo } = req.query;

        const records = await db.any(`
            select kmkm_komn_1 as "testName", seif_jsuu_1 as "propertyValue",
                   coating_lot as "coatingLot", coating_date as "coatingDate", 
                   left(kmkm_akb || '__', 2) || left(kmkm_bkb || '__', 2) || left(kmkm_ckb || '__', 2) as "tCode" 
                from coating_lot_records
                left join seisekf on coating_lot = seif_lot
                left join komokum on kmkm_akb = seif_akb and kmkm_bkb = seif_bkb and kmkm_ckb = seif_ckb
            where seif_seq = '091'
                and product_code = \${productCode}
                and coating_date >= \${coatingDateFrom}
                and coating_date <= \${coatingDateTo}
            order by coating_lot
        `, { productCode, coatingDateFrom, coatingDateTo });

        const rows = [['GroupName', 'ChartName', 'point_time', 'point_val', 'Batch_ID', 'EQP_id']];

        for (const { testName, propertyValue, coatingLot, coatingDate, tCode } of records) {
            if (testName == '') {
                rows.push(['GroupA', tCode, dayjs(coatingDate).format('YYYY/MM/DD 00:00'), propertyValue, coatingLot, '']);
            }
            else {

                // rows.push(['GroupA', toHalfWidth(testName), dayjs(coatingDate).format('YYYY/MM/DD 00:00'), propertyValue, coatingLot, '']);
                rows.push(['GroupA', testName, dayjs(coatingDate).format('YYYY/MM/DD 00:00'), propertyValue, coatingLot, '']);
            }
        }

        const csv = rows.map(row => row.join(',')).join('\n') + '\n';

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="' + codec(productCode) + '.csv"');
        res.send(csv);
    } catch (err) {
        next(err);
    }
});


// 全角英数を半角英数に変換
function toHalfWidth(str) {
    str = str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    str = str.replace(/　/g, ' ');
    return str;
}


// 仕掛品ロットを圧縮ロットに変換
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


// 仕掛品コードを製品コードに変換
const codec = (code) => {
    if (!code) return '';

    const map = {
        '5': '0',
        '6': '1',
        '7': '2',
        '8': '3',
        '9': '4',
    };

    const first = code.charAt(0);
    const rest = code.slice(1, 9);

    return (map[first] ?? first) + rest;
};

module.exports = router;

