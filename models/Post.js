// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    tag: {
        type: String,
        enum: ['upcoming', 'past'],
        default: 'past',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const PostModel = mongoose.model('Post', postSchema);

module.exports = PostModel;
