const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const dbURL = process.env.DB_URL || 'mongodb://mongo:27017/todolist'; 

mongoose.connect(dbURL)
    .then(() => console.log("MongoDB (Upgraded) terhubung..."))
    .catch(err => console.log(err));

const Todo = require('./models/Todo');


// 1. (READ) GET SEMUA TUGAS (YANG TIDAK DIARSIP)
app.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find({ isArchived: false }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. (READ) GET SEMUA TUGAS YANG DIARSIP
app.get('/todos/archived', async (req, res) => {
    try {
        const archivedTodos = await Todo.find({ isArchived: true }).sort({ createdAt: -1 });
        res.json(archivedTodos);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. (CREATE) BUAT TUGAS BARU
app.post('/todos', async (req, res) => {
    try {
        const newTodo = new Todo({
            text: req.body.text,
            priority: req.body.priority,
            due: req.body.due,
            tags: req.body.tags,
        });
        const savedTodo = await newTodo.save();
        res.json(savedTodo);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. (UPDATE) EDIT TUGAS (Text, Priority, Due, Tags)
app.put('/todos/:id', async (req, res) => {
    try {
        const { text, priority, due, tags } = req.body;
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            { text, priority, due, tags },
            { new: true } 
        );
        res.json(updatedTodo);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. (UPDATE) TOGGLE SELESAI
app.put('/todos/toggle/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        todo.completed = !todo.completed;
        const updatedTodo = await todo.save();
        res.json(updatedTodo);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. (UPDATE) ARSIPKAN TUGAS
app.put('/todos/archive/:id', async (req, res) => {
    try {
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            { isArchived: true, completed: false },
            { new: true }
        );
        res.json(updatedTodo);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 7. (UPDATE) KEMBALIKAN TUGAS DARI ARSIP
app.put('/todos/restore/:id', async (req, res) => {
    try {
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            { isArchived: false },
            { new: true }
        );
        res.json(updatedTodo);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 8. (DELETE) HAPUS SEMUA ARSIP
app.delete('/todos/archive/clear', async (req, res) => {
    try {
        await Todo.deleteMany({ isArchived: true });
        res.json({ success: true, message: "Arsip dikosongkan." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 9. (UPDATE) ARSIPKAN SEMUA YANG SELESAI
app.post('/todos/archive/completed', async (req, res) => {
    try {
        await Todo.updateMany(
            { completed: true, isArchived: false },
            { isArchived: true }
        );
        res.json({ success: true, message: "Tugas selesai diarsip." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server (Upgraded) berjalan di port ${PORT}`));