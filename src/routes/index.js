const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const modules = path.join(__dirname, 'modules');

const routes = (directory, route = '') => {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
        const absolute = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            routes(absolute, path.join(route, entry.name));
        } else if (entry.name.charAt(0) !== '_') {
            const basename = path.basename(entry.name, '.js');
            const routePath = path.join(route, ...basename.split('_'));
            router.use('/' + routePath, require(absolute));
        }
    }
};
routes(modules);

module.exports = router;
