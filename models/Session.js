// models/Session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    tag: { type: String, enum: ['upcoming', 'past'], default: 'upcoming' },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Session = mongoose.model('sessions', sessionSchema);

module.exports = Session;
