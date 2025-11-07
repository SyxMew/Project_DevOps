const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
    // text dan completed sudah ada, tapi kita tambahkan yang baru:
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
        default: Date.now // Biarkan DB yang menangani ini
    },
    // --- KOLOM BARU UNTUK FITUR BARU ---
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
    isArchived: { // Ini untuk halaman "Arsip"
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Todo', TodoSchema);