const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String
    },
    avatar: {
        type: String
    },
    calendarAccessToken: { type: String },
    calendarRefreshToken: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
