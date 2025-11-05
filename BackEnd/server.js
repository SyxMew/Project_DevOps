const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json()); // Middleware untuk parsing JSON
app.use(cors()); // Middleware untuk CORS

// Jika Anda menjalankan 'node server.js' (Metode LOKAL/HYBRID):
const dbURL = 'mongodb://mongo:27017/Database';

// Jika Anda menjalankan 'docker-compose up' (Metode FULL DOCKER):
// const dbURL = 'mongodb://mongo:27017/todolist';


mongoose.connect(dbURL)
    .then(() => console.log("MongoDB terhubung..."))
    .catch(err => console.log(err));

// Import model SETELAH koneksi
const Todo = require('./models/Todo');

// --- RUTE CRUD LENGKAP ---

// 1. READ (Get all todos)
app.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. CREATE (Add new todo)
app.post('/todos', async (req, res) => {
    try {
        const newTodo = new Todo({
            text: req.body.text
        });
        const savedTodo = await newTodo.save();
        res.json(savedTodo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. UPDATE (Toggle complete)
// INI YANG KEMUNGKINAN BESAR HILANG DARI KODE ANDA
app.put('/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) return res.status(404).json({ msg: 'Todo tidak ditemukan' });

        // Balik statusnya (dari false ke true, atau true ke false)
        todo.completed = !todo.completed; 
        const updatedTodo = await todo.save();
        res.json(updatedTodo); // Kirim data yang sudah di-update kembali ke frontend
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. DELETE (Remove todo)
// INI JUGA KEMUNGKINAN BESAR HILANG DARI KODE ANDA
app.delete('/todos/:id', async (req, res) => {
    try {
        const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
        if (!deletedTodo) return res.status(404).json({ msg: 'Todo tidak ditemukan' });
        res.json({ success: true, deleted: deletedTodo });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));