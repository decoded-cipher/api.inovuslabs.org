
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const StockLogSchema = new mongoose.Schema({
    stocklog_id: {
        type: String,
        required: true,
        unique: true,
        default: () => nanoid()
    },
    user_id: {
        type: String,
        required: true
    },
    components: [
        {
            device_id: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            qty: {
                type: Number,
                required: true
            }
        }
    ],
    mode: {
        type: String,
        required: true,
        default: 'stock_issue',
        enum: ['stock_issue', 'stock_return']
    },
    approver_id: {
        type: String,
        required: false,
        default: null
    },
    status: {
        type: String,
        required: true,
        default: 'entry.pending',
        enum: ['entry.pending', 'entry.approved', 'entry.rejected', 'exit.pending', 'exit.approved', 'exit.rejected']
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
}, { collection: 'stock_logs' })

module.exports = mongoose.model('StockLog', StockLogSchema);