

const Device = require('../models/stock/devices');
const DeviceLog = require('../models/stock/device_logs');


module.exports = {


    deviceLogEntry: async (data, user_id) => {
        return new Promise(async (resolve, reject) => {

            let { device_id, name, type, qty, mode, description, image, price, date_of_purchase, vendor, remarks } = data;

            let update = {};
            mode === 'stock_remove' ? update = { $inc: { qty_available: -qty } } : update = { $inc: { qty_purchased: qty, qty_available: qty } };


            if (device_id) {

                await Device.findOneAndUpdate({ device_id: device_id }, update, { new: true })
                    .then(async device => {

                        let newDeviceLog = new DeviceLog({
                            device_id: device.device_id,
                            mode: mode,
                            qty: qty,
                            author_id: user_id,

                            price: price,
                            vendor: vendor,
                            date_of_purchase: date_of_purchase,

                            remarks: remarks
                        });

                        await newDeviceLog.save()
                            .then(deviceLog => {
                                resolve({
                                    status: 201,
                                    message: [
                                        'Device updated successfully',
                                        'Device log created successfully'
                                    ]
                                });
                            })
                            .catch(err => {
                                reject({
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
                        reject({
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
                    reject({
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
                    .then(async device => {

                        let newDeviceLog = new DeviceLog({
                            device_id: device.device_id,
                            qty: qty,
                            author_id: user_id,
                            price: price,
                            vendor: vendor,
                            date_of_purchase: date_of_purchase,
                            remarks: remarks
                        });

                        await newDeviceLog.save()
                            .then(deviceLog => {
                                resolve({
                                    status: 201,
                                    message: [
                                        'Device created successfully',
                                        'Device log created successfully'
                                    ]
                                });
                            })
                            .catch(err => {
                                reject({
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
                        reject({
                            status: 400,
                            message: [
                                'Error creating device',
                                'Error creating device log'
                            ],
                            error: err
                        });
                    });
            }

        });
    },



    deviceLogDelete: async (devicelog_id) => {
        return new Promise(async (resolve, reject) => {

            await DeviceLog.findOneAndDelete({ devicelog_id: devicelog_id })
                .then(async data => {

                    let update = {};
                    if (data.mode === 'stock_insert') {
                        update = { $inc: { qty_available: -data.qty, qty_purchased: -data.qty } };
                    } else if (data.mode === 'stock_remove') {
                        update = { $inc: { qty_available: data.qty } };
                    }

                    await Device.findOneAndUpdate({ device_id: data.device_id }, update, { new: true })
                        .then(async device => {

                            if (device.qty_available <= 0) {

                                await Device.findOneAndDelete({ device_id: data.device_id })
                                    .then(device => {
                                        resolve({
                                            status: 200,
                                            message: [
                                                'Device log deleted successfully',
                                                'Device updated successfully',
                                                'Device deleted successfully'
                                            ]
                                        });
                                    })
                                    .catch(err => {
                                        reject({
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
                                resolve({
                                    status: 200,
                                    message: [
                                        'Device log deleted successfully',
                                        'Device updated successfully'
                                    ]
                                });
                            }

                        })
                        .catch(err => {
                            reject({
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
                    reject({
                        status: 400,
                        message: [
                            'Error deleting device log',
                            'Error updating device'
                        ],
                        error: err
                    });
                });

        });
    },
    

};

