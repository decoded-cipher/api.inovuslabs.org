
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const RoleSchema = new mongoose.Schema({
    role_id: {
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
    permissions: {
        type: Array,
        required: false,
        default: []
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
}, { collection: 'roles' });

module.exports = mongoose.model('Role', RoleSchema);