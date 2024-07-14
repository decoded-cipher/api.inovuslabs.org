
const express = require('express');
const router = express.Router();

const Device = require('../../../models/stock/devices');
const DeviceLog = require('../../../models/stock/device_logs');

const verifyToken = require('../../../middleware/authentication');
const checkPermission = require('../../../middleware/authorization');

const { deviceLogDelete } = require('../../../helpers/deviceHelper');



/**
 * @route   GET /api/v1/stock/device_log
 * @desc    Get all device logs with pagination
 * @access  Public
 * @params  page, limit, search
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/stock/device_log?page=1&limit=10&search=resource
 **/

router.get('/', verifyToken, checkPermission(['org.device_log.read']), async (req, res) => {

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let search = req.query.search || null;

    let query = {};
    if (search) {
        query = { $text: { $search: search } };
    }

    let totalDeviceLogs = await DeviceLog.countDocuments(query)
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving device logs',
                error: err
            });
        });

    let deviceLogs = await DeviceLog.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving device logs',
                error: err
            });
        });

    res.status(200).json({
        status: 200,
        message: 'Device logs retrieved successfully',
        data: {
            deviceLogs: deviceLogs,
            meta: {
                total: totalDeviceLogs,
                page: page,
                limit: limit,
                search: search
            }
        }
    });

});



/**
 * @route   GET /api/v1/stock/device_log/:devicelog_id
 * @desc    Get a device log by ID
 * @access  Public
 * @params  devicelog_id
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 *
 * @example /api/v1/stock/device_log/60f5a4d2b4e4c20015f6d1c3
 **/

router.get('/:devicelog_id', verifyToken, checkPermission(['org.device_log.read']), async (req, res) => {

    await DeviceLog.aggregate([
        { $match: { devicelog_id: req.params.devicelog_id } },
        {
            $lookup: {
                from: 'devices',
                localField: 'device_id',
                foreignField: 'device_id',
                as: 'device'
            }
        },
        { $unwind: '$device' }
    ])
        .then(data => {
            res.status(200).json({
                status: 200,
                message: 'Device log retrieved successfully',
                data: data
            });
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving device log',
                error: err
            });
        });

});



/**
 * @route   PATCH /api/v1/stock/device_log/:devicelog_id
 * @desc    Update a device log by ID
 * @access  Private
 * @params  devicelog_id, device_id, mode, qty, price, vendor, date_of_purchase, remarks
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/stock/device_log/60f5a4d2b4e4c20015f6d1c3
 **/

router.patch('/:devicelog_id', verifyToken, checkPermission(['own.device_log.write', 'org.device_log.write'], 'any'), async (req, res) => {

    let { price, vendor, date_of_purchase, remarks } = req.body;

    await DeviceLog.findOneAndUpdate({ devicelog_id: req.params.devicelog_id }, {

        price: price,
        vendor: vendor,
        date_of_purchase: date_of_purchase,
        remarks: remarks,
        updated_at: Date.now()

    }, { new: true })
        .then(data => {
            res.status(200).json({
                status: 200,
                message: 'Device log updated successfully',
                data: data
            });
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error updating device log',
                error: err
            });
        });



});



/**
 * @route   DELETE /api/v1/stock/device_log/:devicelog_id
 * @desc    Delete a device log by ID
 * @access  Private
 * @params  devicelog_id
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/stock/device_log/60f5a4d2b4e4c20015f6d1c3
 **/

router.delete('/:devicelog_id', verifyToken, checkPermission(['org.device.destroy', 'org.device_log.destroy', 'own.device_log.destroy'], 'any'), async (req, res) => {

    await deviceLogDelete(req.params.devicelog_id)
        .then(data => {
            res.status(data.status).json({
                status: data.status,
                message: data.message,
                // data: data
            });
        })
        .catch(err => {
            res.status(err.status).json({
                status: err.status,
                message: err.message,
                error: err.error
            });
        });

});



module.exports = router;