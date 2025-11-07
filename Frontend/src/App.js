import React, { useState, useEffect } from 'react';
import axios from 'axios';
// (BARU) Menggunakan ikon yang lebih simpel
import { FaPlus, FaTrashAlt, FaRegCircle, FaCheckCircle } from 'react-icons/fa';
import './App.css'; 

// Pastikan ini adalah alamat backend Anda
const API_URL = 'http://localhost:5000';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');

  // (READ) Mengambil data saat aplikasi dimuat
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API_URL}/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error("Error mengambil todos:", error);
    }
  };

  // (CREATE) Menambah todo baru
  const addTodo = async (e) => {
    e.preventDefault();
    if (newTodoText.trim() === '') return;

    try {
      const response = await axios.post(`${API_URL}/todos`, { text: newTodoText });
      setTodos([response.data, ...todos]); // Tambah di awal list
      setNewTodoText('');
    } catch (error) {
      console.error("Error menambah todo:", error);
    }
  };

  // (UPDATE) Mengubah status selesai/belum
  const toggleComplete = async (id) => {
    try {
      const response = await axios.put(`${API_URL}/todos/${id}`);
      setTodos(todos.map(todo =>
        todo._id === id ? response.data : todo
      ));
    } catch (error) {
      console.error("Error update todo:", error);
    }
  }

  // (DELETE) Menghapus todo
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error("Error menghapus todo:", error);
    }
  };

  // Hitung sisa tugas
  const pendingTodos = todos.filter(todo => !todo.completed).length;

  return (
    <div className="app-container">
      <div className="todo-box">
        
        {/* --- Header --- */}
        <div className="header">
          <h1>My To-Do List</h1>
          <span className="task-counter">
            {pendingTodos === 0 && todos.length > 0
              ? "Semua tugas selesai!"
              : `${pendingTodos} tugas tersisa`
            }
          </span>
        </div>

        {/* --- Form Input --- */}
        <form className="add-form" onSubmit={addTodo}>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Tulis tugas baru di sini..."
          />
          <button type="submit" aria-label="Tambah tugas">
            <FaPlus />
          </button>
        </form>

        {/* --- Daftar To-Do --- */}
        <ul className="todo-list">
          {todos.length === 0 && (
            <p className="empty-message">Daftar tugas Anda masih kosong.</p>
          )}

          {todos.map(todo => (
            <li key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              
              {/* Checkbox Kustom */}
              <div className="checkbox" onClick={() => toggleComplete(todo._id)}>
                {todo.completed ? <FaCheckCircle /> : <FaRegCircle />}
              </div>

              {/* Teks To-Do */}
              <span className="todo-text">
                {todo.text}
              </span>

              {/* Tombol Hapus */}
              <button className="delete-btn" onClick={() => deleteTodo(todo._id)} aria-label="Hapus tugas">
                <FaTrashAlt />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;