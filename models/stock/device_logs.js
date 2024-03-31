
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const DeviceLogSchema = new mongoose.Schema({
    devicelog_id: {
        type: String,
        required: true,
        unique: true,
        default: () => nanoid()
    },
    device_id: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        required: true,
        default: 'stock_insert',
        enum: ['stock_insert', 'stock_remove']
    },
    qty: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: false
    },
    vendor: {
        type: String,
        required: false
    },
    date_of_purchase: {
        type: Date,
        required: true,
        default: Date.now
    },
    author_id: {
        type: String,
        required: true
    },
    remarks: {
        type: String,
        required: false
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now
    },
    updated_at: {
        type: Date,
        required: true,
        default: Date.now
    }
}, { collection: 'device_logs' })

module.exports = mongoose.model('DeviceLog', DeviceLogSchema);