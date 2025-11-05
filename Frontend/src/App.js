import React, { useState, useEffect } from 'react';
import axios from 'axios';
// --- BARU: Import Ikon ---
import { FaPlus, FaTrashAlt, FaRegCircle, FaCheckCircle } from 'react-icons/fa';
import './App.css'; 

const API_URL = 'http://localhost:5000';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');

  // (READ)
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

  // (CREATE)
  const addTodo = async (e) => {
    e.preventDefault();
    if (newTodoText.trim() === '') return;

    try {
      const response = await axios.post(`${API_URL}/todos`, { text: newTodoText });
      // Tambah di awal list untuk efek visual yang lebih baik
      setTodos([response.data, ...todos]); 
      setNewTodoText('');
    } catch (error) {
      console.error("Error menambah todo:", error);
    }
  };

  // (UPDATE)
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

  // (DELETE)
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error("Error menghapus todo:", error);
    }
  };

  // --- BARU: Hitung sisa To-Do ---
  const pendingTodos = todos.filter(todo => !todo.completed).length;

  return (
    <div className="app">
      <div className="container">
        {/* --- BARU: Header dengan Counter --- */}
        <div className="header">
          <h1>Mantap Jiwa</h1>
          <div className="task-counter">
            {pendingTodos === 0
              ? "Semua tugas selesai!"
              : `Anda punya ${pendingTodos} tugas tersisa`
            }
          </div>
        </div>

        {/* --- Form yang diperbarui dengan Ikon --- */}
        <form className="add-form" onSubmit={addTodo}>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Tambahkan tugas baru..."
          />
          <button type="submit" aria-label="Tambah tugas">
            <FaPlus />
          </button>
        </form>

        {/* --- List yang diperbarui dengan Ikon dan Checkbox --- */}
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

              {/* Tombol Hapus dengan Ikon */}
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