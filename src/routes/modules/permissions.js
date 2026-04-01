const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', verify('permissions:read'), async (req, res, next) => {
    try {
        const permissions = await db.any(`
            select * from crud.permissions order by id
        `);

        res.status(200).json(permissions);
    } catch (err) {
        next(err);
    }
});

router.get('/:id', verify('permissions:read'), async (req, res, next) => {
    try {
        const permission = await db.oneOrNone(`
            select * from crud.permissions where id = \${id}
        `, { id: req.params.id });
        if (!permission) throw new HttpError('PERMISSION_NOT_FOUND', 404);

        res.status(200).json(permission);
    } catch (err) {
        next(err);
    }
});

router.post('/', verify('permissions:create'), async (req, res, next) => {
    try {
        const exists = await db.oneOrNone(`
            select id from crud.permissions where id = \${id}
        `, { id: req.body.id });
        if (exists) throw new HttpError('PERMISSION_ALREADY_EXISTS', 409);

        const permission = {};
        permission.id = req.body.id;
        permission.name = req.body.name;
        permission.isActive = req.body.isActive;
        permission.createdAt = new Date();
        permission.createdBy = req.user.name;
        permission.createdById = req.user.id;
        permission.updatedAt = new Date();
        permission.updatedBy = req.user.name;
        permission.updatedById = req.user.id;

        await db.none(`
            insert into crud.permissions (${snakecase(Object.keys(permission))})
            values (${Object.keys(permission).map(column => '${' + column + '}')})
        `, permission);

        res.status(201).json(permission);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', verify('permissions:update'), async (req, res, next) => {
    try {
        const permission = await db.oneOrNone(`
            select * from crud.permissions where id = \${id}
        `, { id: req.params.id });
        if (!permission) throw new HttpError('PERMISSION_NOT_FOUND', 404);

        permission.name = req.body.name;
        permission.isActive = req.body.isActive;
        permission.updatedAt = new Date();
        permission.updatedBy = req.user.name;
        permission.updatedById = req.user.id;

        await db.none(`
            update crud.permissions set ${Object.keys(permission).map(column => snakecase(column) + ' = ${' + column + '}')}
            where id = \${id}
        `, permission);

        res.status(200).json(permission);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', verify('permissions:delete'), async (req, res, next) => {
    try {
        const permission = await db.oneOrNone(`
            select * from crud.permissions where id = \${id}
        `, { id: req.params.id });
        if (!permission) throw new HttpError('PERMISSION_NOT_FOUND', 404);

        await db.none(`
            delete from crud.permissions where id = \${id}
        `, { id: req.params.id });

        res.status(200).json(permission);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
