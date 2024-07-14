
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const ResourceSchema = new mongoose.Schema({
    resource_id: {
        type: String,
        required: true,
        unique: true,
        default: () => nanoid()
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: Array,
        required: false,
        default: ["General"]
    },
    resources: {
        type: Array,
        required: true,
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
}, { collection: 'resources' });

module.exports = mongoose.model('Resource', ResourceSchema);