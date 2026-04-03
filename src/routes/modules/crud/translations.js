const express = require('express');
const router = express.Router();
const snakecase = require('@/helpers/snakecase');
const db = require('@/db');

router.get('/', verify('translations:read'), async (req, res, next) => {
    try {
        const translations = await db.any(`
            select * from crud.translations order by id
        `);

        res.status(200).json(translations);
    } catch (err) {
        next(err);
    }
});

router.get('/:id', verify('translations:read'), async (req, res, next) => {
    try {
        const translation = await db.oneOrNone(`
            select * from crud.translations where id = \${id}
        `, { id: req.params.id });
        if (!translation) throw new HttpError('TRANSLATION_NOT_FOUND', 404);

        res.status(200).json(translation);
    } catch (err) {
        next(err);
    }
});

router.post('/', verify('translations:create'), async (req, res, next) => {
    try {
        const exists = await db.oneOrNone(`
            select id from crud.translations where id = \${id}
        `, { id: req.body.id });
        if (exists) throw new HttpError('TRANSLATION_ALREADY_EXISTS', 409);

        const translation = {};
        translation.id = req.body.id;
        translation.locales = req.body.locales;
        translation.createdAt = new Date();
        translation.createdBy = req.user.name;
        translation.createdById = req.user.id;
        translation.updatedAt = new Date();
        translation.updatedBy = req.user.name;
        translation.updatedById = req.user.id;

        await db.none(`
            insert into crud.translations (${snakecase(Object.keys(translation))})
            values (${Object.keys(translation).map(column => '${' + column + '}')})
        `, translation);

        res.status(201).json(translation);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', verify('translations:update'), async (req, res, next) => {
    try {
        const translation = await db.oneOrNone(`
            select * from crud.translations where id = \${id}
        `, { id: req.params.id });
        if (!translation) throw new HttpError('TRANSLATION_NOT_FOUND', 404);

        translation.locales = req.body.locales;
        translation.updatedAt = new Date();
        translation.updatedBy = req.user.name;
        translation.updatedById = req.user.id;

        await db.none(`
            update crud.translations set ${Object.keys(translation).map(column => snakecase(column) + ' = ${' + column + '}')}
            where id = \${id}
        `, translation);

        res.status(200).json(translation);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', verify('translations:delete'), async (req, res, next) => {
    try {
        const translation = await db.oneOrNone(`
            select * from crud.translations where id = \${id}
        `, { id: req.params.id });
        if (!translation) throw new HttpError('TRANSLATION_NOT_FOUND', 404);

        await db.none(`
            delete from crud.translations where id = \${id}
        `, { id: req.params.id });

        res.status(200).json(translation);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
