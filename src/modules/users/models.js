const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({

    name: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    image: {
        type: String,
    },
    mobile: {
        type: Number,
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
}, { strict: true, timestamps: true });

module.exports = mongoose.model('User', userSchema);
