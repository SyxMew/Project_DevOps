const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now 
    },
    due: {
        type: Date,
        default: null
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    tags: {
        type: [String],
        default: []
    },
    isArchived: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Todo', TodoSchema);