
const express = require('express');
const router = express.Router();

const Device = require('../../../models/devices');
const DeviceLog = require('../../../models/device_logs');
const verifyToken = require('../../../middleware/authentication');
const checkPermission = require('../../../middleware/authorization');



/**
 * @route   GET /api/v1/stock/devices
 * @desc    Get all devices in stock with pagination
 * @access  Public
 * @params  page, limit, search
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/stock/devices?page=1&limit=10&search=resource
 * 
 * @todo    Add search
 * @todo    Add filter by category
**/

router.get('/', async (req, res) => {

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let search = req.query.search || null;

    let query = {};
    if (search) {
        query = { $text: { $search: search } };
    }

    let totalDevices = await Device.countDocuments(query)
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving devices',
                error: err
            });
        });

    let devices = await Device.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving devices',
                error: err
            });
        });

    res.status(200).json({
        status: 200,
        message: 'Devices retrieved successfully',
        data: {
            devices: devices,
            meta: {
                page: page,
                limit: limit,
                pages: Math.ceil(totalDevices / limit),
                total: totalDevices,
                search: search
            }
        }
    });

});



/**
 * @route   GET /api/v1/stock/device/:id
 * @desc    Get a device by ID
 * @access  Public
 * @params  id
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
*  @example /api/v1/stock/devices/5f1d3f5f3c5e2f1b3c5e2f1b
**/

router.get('/:id', async (req, res) => {
    
    await Device.aggregate([
        { $match: { device_id: req.params.id } },
        {
            $lookup: {
                from: 'device_logs',
                localField: 'device_id',
                foreignField: 'device_id',
                as: 'device_logs'
            }
        }
    ])
        .then(device => {
            res.status(200).json({
                status: 200,
                message: 'Device retrieved successfully',
                data: device
            });
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving device',
                error: err
            });
        });

});



/**
 * @route   POST /api/v1/stock/device
 * @desc    Create a new device
 * @access  Private
 * @params  name, type, qty, mode, description, image, price, date_of_purchase, vendor, remarks
 * @return  status, message, data
 * @error   400, { error }
 * @status  201, 400
 * 
 * @example /api/v1/stock/devices
**/

router.post('/', verifyToken, checkPermission(['org.device.write', 'own.device_log.write'], 'all'), async (req, res) => {

    let {  device_id, name, type, qty, mode, description, image, price, date_of_purchase, vendor, remarks } = req.body;

    let update = {};
    mode === 'stock_remove' ? update = { $inc: { qty_available: -qty } } : update = { $inc: { qty_purchased: qty, qty_available: qty } };

    
    if (device_id) {

        await Device.findOneAndUpdate({ device_id: device_id }, update, { new: true })
            .then(device => {
                let newDeviceLog = new DeviceLog({
                    
                    device_id: device.device_id,
                    mode: mode,
                    qty: qty,
                    author_id: req.user.user_id,

                    price: price,
                    vendor: vendor,
                    date_of_purchase: date_of_purchase,
                    
                    remarks: remarks
                });

                newDeviceLog.save()
                    .then(deviceLog => {
                        res.status(201).json({
                            status: 201,
                            message: [
                                'Device updated successfully',
                                'Device log created successfully'
                            ]
                            // data: device
                        });
                    })
                    .catch(err => {
                        res.status(400).json({
                            status: 400,
                            message: [
                                'Device updated successfully',
                                'Error creating device log'
                            ],
                            error: err
                        });
                    });
            })
            .catch(err => {
                res.status(400).json({
                    status: 400,
                    message: [
                        'Error updating device',
                        'Error creating device log'
                    ],
                    error: err
                });
            });

    } else {

        if (mode === 'stock_remove') {
            res.status(400).json({
                status: 400,
                message: 'Device ID is required for stock removal'
            });
            return;
        }


        let newDevice = new Device({
            name: name,
            type: type,
            qty_available: qty,
            qty_purchased: qty,
            description: description,
            image: image
        });

        await newDevice.save()
            .then(device => {
                let newDeviceLog = new DeviceLog({
                    device_id: device.device_id,
                    qty: qty,
                    author_id: req.user.user_id,
                    price: price,
                    vendor: vendor,
                    date_of_purchase: date_of_purchase,
                    remarks: remarks
                });

                newDeviceLog.save()
                    .then(deviceLog => {
                        res.status(201).json({
                            status: 201,
                            message: [
                                'Device created successfully',
                                'Device log created successfully'
                            ]
                            // data: device
                        });
                    })
                    .catch(err => {
                        res.status(400).json({
                            status: 400,
                            message: [
                                'Device created successfully',
                                'Error creating device log'
                            ],
                            error: err
                        });
                    });
            })
            .catch(err => {
                res.status(400).json({
                    status: 400,
                    message: 'Error creating device',
                    error: err
                });
            });
    }

});



/**
 * @route   PATCH /api/v1/stock/device/:id
 * @desc    Update a device
 * @access  Private
 * @params  id, name, type, description, image
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/stock/devices/5f1d3f5f3c5e2f1b3c5e2f1b
**/

router.patch('/:id', verifyToken, checkPermission(['org.device.write']), async (req, res) => {

    let { name, type, description, image } = req.body;

    await Device.findOneAndUpdate({ device_id: req.params.id }, {
        name: name,
        type: type,
        description: description,
        image: image,
        updated_at: Date.now()
    })
        .then(device => {
            res.status(200).json({
                status: 200,
                message: 'Device updated successfully',
                // data: device
            });
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error updating device',
                error: err
            });
        });

});



/**
 * @route   DELETE /api/v1/stock/device/:id
 * @desc    Delete a device
 * @access  Private
 * @params  id
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/stock/devices/5f1d3f5f3c5e2f1b3c5e2f1b
**/

router.delete('/:id', checkPermission(['org.device.destroy', 'org.device_log.destroy'], 'all'), async (req, res) => {

    await Device.findOneAndDelete({ device_id: req.params.id })
        .then(device => {
            res.status(200).json({
                status: 200,
                message: 'Device deleted successfully',
                // data: device
            });
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error deleting device',
                error: err
            });
        });

});



module.exports = router;