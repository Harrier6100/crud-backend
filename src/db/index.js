const pgp = require('pg-promise')({
    receive({ data }) {
        if (!data.length) return;
        data.forEach((row, i) => {
            data[i] = Object.fromEntries(
                Object.entries(row).map(([column, value]) => [pgp.utils.camelize(column), value])
            );
        });
    }
});

pgp.pg.types.setTypeParser(1700, parseFloat);

const db = pgp(process.env.DB);

module.exports = db;
