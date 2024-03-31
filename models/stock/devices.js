
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const DeviceSchema = new mongoose.Schema({
    device_id: {
        type: String,
        required: true,
        unique: true,
        default: () => nanoid()
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    qty_available: {
        type: Number,
        required: true,
    },
    qty_purchased: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    image: {
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
}, { collection: 'devices' })

module.exports = mongoose.model('Device', DeviceSchema);