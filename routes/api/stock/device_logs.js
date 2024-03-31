
const express = require('express');
const router = express.Router();

const Device = require('../../../models/devices');
const DeviceLog = require('../../../models/device_logs');

const verifyToken = require('../../../middleware/authentication');
const checkPermission = require('../../../middleware/authorization');



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

    // Check if device log exists and belongs to user
    await DeviceLog.findOne({ devicelog_id: req.params.devicelog_id })
        .then(async data => {
            if ((data.author_id == req.user.user_id) || checkPermission(['org.device_log.write'])) {
                
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

            } else {
                return res.status(401).json({
                    status: 401,
                    message: 'This device log does not belong to you. You do not have permission to update it'
                });
            }
        })
        .catch(err => {
            return res.status(400).json({
                status: 400,
                message: 'Error checking device log ownership',
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

router.delete('/:devicelog_id', checkPermission(['org.device.destroy', 'org.device_log.destroy'], 'any'), async (req, res) => {

    await DeviceLog.findOneAndDelete({ devicelog_id: req.params.devicelog_id })
        .then(async data => {

            let update = {};
            if (data.mode === 'stock_insert') {
                update = { $inc: { qty_available: -data.qty, qty_purchased: -data.qty } };
            } else if (data.mode === 'stock_remove') {
                update = { $inc: { qty_available: data.qty } };
            }

            await Device.findOneAndUpdate({ device_id: data.device_id }, update, { new: true })
                .then(device => {

                    if (device.qty_available <= 0) {

                        Device.findOneAndDelete({ device_id: data.device_id })
                            .then(device => {
                                res.status(200).json({
                                    status: 200,
                                    message: [
                                        'Device log deleted successfully',
                                        'Device updated successfully',
                                        'Device deleted successfully'
                                    ]
                                    // data: data
                                });
                            })
                            .catch(err => {
                                res.status(400).json({
                                    status: 400,
                                    message: [
                                        'Device log deleted successfully',
                                        'Device updated successfully',
                                        'Error deleting device'
                                    ],
                                    error: err
                                });
                            });

                    } else {
                        res.status(200).json({
                            status: 200,
                            message: [
                                'Device log deleted successfully',
                                'Device updated successfully'
                            ]
                            // data: data
                        });
                    }

                })
                .catch(err => {
                    res.status(400).json({
                        status: 400,
                        message: [
                            'Device log deleted successfully',
                            'Error updating device'
                        ],
                        error: err
                    });
                });

        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: [
                    'Error deleting device log',
                    'Error updating device'
                ],
                error: err
            });
        });

});



module.exports = router;