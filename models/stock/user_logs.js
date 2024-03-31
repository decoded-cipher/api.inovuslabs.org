
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const UserLogSchema = new mongoose.Schema({
    userlog_id: {
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
            },
            approver: [
                {
                    approver_id: {
                        type: String,
                        required: true
                    },
                    action: {
                        type: String,
                        required: true,
                        default: 'entry.pending',
                        enum: ['entry.approved', 'entry.rejected', 'exit.approved', 'exit.rejected']
                    },
                }
            ],
            created_at: {
                type: Date,
                required: true
            },
            updated_at: {
                type: Date,
                required: true
            }
        }
    ],
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
}, { collection: 'user_logs' })

module.exports = mongoose.model('UserLog', UserLogSchema);