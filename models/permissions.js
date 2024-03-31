
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const PermissionSchema = new mongoose.Schema({
    permission_id: {
        type: String,
        required: true,
        unique: true,
        default: () => nanoid()
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: false
    },    
    created_at: {
        type: Date,
        required: false,
        default: Date.now
    },
    updated_at: {
        type: Date,
        required: false,
        default: Date.now
    }

}, { collection: 'permissions' });

module.exports = mongoose.model('Permission', PermissionSchema);