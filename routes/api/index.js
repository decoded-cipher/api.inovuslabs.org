
const express = require('express');
const router = express.Router();


const resourcesRouter = require('./resources');
const permissionsRouter = require('./permissions');
const rolesRouter = require('./roles');
const stockRouter = require('./stock');
const usersRouter = require('./users');
const sessionRouter = require('./sessionHandling')


router.use('/resources', resourcesRouter);
router.use('/permissions', permissionsRouter);
router.use('/roles', rolesRouter);
router.use('/stock', stockRouter);
router.use('/users', usersRouter);
router.use('/session', sessionRouter);


module.exports = router;
