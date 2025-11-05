import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrashAlt, FaRegCircle, FaCheckCircle, FaClipboardList, FaUsers, FaCalendarAlt, FaCog, FaThList } from 'react-icons/fa'; // Menambahkan ikon untuk sidebar
import './App.css'; 

const API_URL = 'http://localhost:5000';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API_URL}/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (newTodoText.trim() === '') return;

    try {
      const response = await axios.post(`${API_URL}/todos`, { text: newTodoText });
      setTodos([response.data, ...todos]);
      setNewTodoText('');
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const toggleComplete = async (id) => {
    try {
      const response = await axios.put(`${API_URL}/todos/${id}`);
      setTodos(todos.map(todo =>
        todo._id === id ? response.data : todo
      ));
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  }

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const pendingTodos = todos.filter(todo => !todo.completed).length;

  return (
    <div className="dashboard-app">
      <aside className="sidebar">
        <div className="logo">
          My Task
        </div>
        <nav className="main-nav">
          <ul>
            <li className="nav-item active">
              <FaClipboardList className="nav-icon" />
              <span>Project Overview</span>
            </li>
            <li className="nav-item">
              <FaUsers className="nav-icon" />
              <span>Team</span>
            </li>
            <li className="nav-item">
              <FaCalendarAlt className="nav-icon" />
              <span>Calendar</span>
            </li>
            <li className="nav-item">
              <FaCog className="nav-icon" />
              <span>Settings</span>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <div className="project-info">
            <h2>Mantap Jiwa</h2>
            <span className="task-counter">
              {pendingTodos === 0
                ? "All tasks completed!"
                : `${pendingTodos} tasks left`
              }
            </span>
          </div>
          <button className="new-task-btn">
            <FaPlus /> New Task
          </button>
        </header>

        <section className="todo-section">
          <div className="section-header">
            <h3>My Tasks</h3>
            <form className="add-form" onSubmit={addTodo}>
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="Add a new task..."
              />
              <button type="submit" aria-label="Add task">
                <FaPlus />
              </button>
            </form>
          </div>

          {todos.length === 0 && (
            <p className="empty-message">Your task list is empty.</p>
          )}

          <div className="task-grid">
            {todos.map(todo => (
              <div key={todo._id} className={`task-card ${todo.completed ? 'completed' : ''}`}>
                <div className="card-header">
                  <div className="checkbox" onClick={() => toggleComplete(todo._id)}>
                    {todo.completed ? <FaCheckCircle /> : <FaRegCircle />}
                  </div>
                  <button className="delete-btn" onClick={() => deleteTodo(todo._id)} aria-label="Delete task">
                    <FaTrashAlt />
                  </button>
                </div>
                <div className="card-body">
                  <span className="todo-text">
                    {todo.text}
                  </span>
                  <div className="task-meta">
                    <span className="task-tag design">Design</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;