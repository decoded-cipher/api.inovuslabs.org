
const express = require('express');
const router = express.Router();


const deviceRouter = require('./devices');
const deviceLogRouter = require('./device_logs');
const stockLogRouter = require('./stock_logs');


router.use('/device', deviceRouter);
router.use('/device_log', deviceLogRouter);
router.use('/stock_log', stockLogRouter);


module.exports = router;
