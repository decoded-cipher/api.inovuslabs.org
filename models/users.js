
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const UserSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        unique: true,
        default: () => nanoid()
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /\d{10}/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /\S+@\S+\.\S+/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    dob: {
        type: Date,
        required: false,
        default: Date.now
    },
    gender: {
        type: String,
        required: false
    },
    department: {
        type: String,
        required: false,
    },
    batch: {
        type: String,
        required: false,
    },
    college: {
        type: String,
        required: false,
        default: "Kristu Jyoti College of Management and Technology"
    },
    roles: {
        type: Array,
        required: true,
        default: ["General User"]
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "inactive",
        enum: ["active", "inactive", "suspended", "deleted"]
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
}, { collection: 'users' })

module.exports = mongoose.model('User', UserSchema);