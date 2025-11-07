import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import './App.css'; 

const API_URL = "http://localhost:5000";

export default function TodoAppEnhanced() {
  return (
    <Router>
      <div className="app-container">
        <div className="main-content">
          <TopNav />
          <main className="main-section">
            <Routes>
              <Route path="/" element={<TodoPage />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

function TopNav() {
  return (
    <nav className="top-nav">
      <div className="nav-logo">
        <div className="logo-icon">TL</div>
        <div>
          <h1 className="logo-title">TodoLux</h1>
          <p className="logo-subtitle">Buat, kelola, dan gerakkan tugasmu dengan gaya</p>
        </div>
      </div>
      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/archive">Archive</NavLink>
      </div>
    </nav>
  );
}

function NavLink({ to, children }) {
  return (
    <Link to={to} className="nav-link-item">
      {children}
    </Link>
  );
}

function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdDesc");
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await axios.get(`${API_URL}/todos`);
        setTodos(sortTodos(res.data, sortBy));
      } catch (e) { console.error("Gagal mengambil todos", e); }
    };
    fetchTodos();
  }, [sortBy]);

  const pendingCount = todos.filter((t) => !t.completed).length;

  const addTodo = async (payload) => {
    try {
      const res = await axios.post(`${API_URL}/todos`, {
        text: payload.text,
        due: payload.due || null,
        priority: payload.priority || "medium",
        tags: payload.tags || [],
      });
      setTodos([res.data, ...todos]);
    } catch (e) { console.error("Gagal menambah todo", e); }
  };

  const updateTodo = async (id, patch) => {
    try {
      const res = await axios.put(`${API_URL}/todos/${id}`, patch);
      setTodos(todos.map((t) => (t._id === id ? res.data : t)));
    } catch (e) { console.error("Gagal update todo", e); }
  };

  const toggleTodo = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/todos/toggle/${id}`);
      setTodos(todos.map((t) => (t._id === id ? res.data : t)));
    } catch (e) { console.error("Gagal toggle todo", e); }
  }

  const removeTodo = async (id) => {
    try {
      await axios.put(`${API_URL}/todos/archive/${id}`);
      setTodos(todos.filter((t) => t._id !== id));
    } catch (e) { console.error("Gagal mengarsip todo", e); }
  };

  const clearCompleted = async () => {
    try {
      await axios.post(`${API_URL}/todos/archive/completed`);
      setTodos(todos.filter((t) => !t.completed));
    } catch (e) { console.error("Gagal arsip completed", e); }
  };

  const dragIndexRef = useRef(null);
  const onDragStart = (e, idx) => {
    dragIndexRef.current = idx;
    e.dataTransfer.effectAllowed = "move";
  };
  const onDrop = (e, dropIdx) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === dropIdx) return;
    const arr = Array.from(todos);
    const [moved] = arr.splice(from, 1);
    arr.splice(dropIdx, 0, moved);
    setTodos(arr);
    dragIndexRef.current = null;
  };
  const filtered = todos
    .filter((t) => (filter === "all" ? true : filter === "pending" ? !t.completed : t.completed))
    .filter((t) => t.text.toLowerCase().includes(query.toLowerCase()));
  const visible = sortTodos(filtered, sortBy);

  return (
    <div className="todo-page-grid">
      <section className="todo-main-column">
        <div className="card">
          <div className="flex-between">
            <div>
              <h2 className="card-title">My Tasks</h2>
              <p className="card-subtitle">{pendingCount} tugas belum selesai — buat hari ini terasa produktif ✨</p>
            </div>
            <div className="button-group">
              <button
                className="button button-secondary"
                onClick={() => setShowForm((s) => !s)}
              >
                {showForm ? "Sembunyikan" : "Tambah tugas"}
              </button>
              <button className="button button-danger" onClick={clearCompleted}>
                Arsipkan selesai
              </button>
            </div>
          </div>

          <div className="controls-grid">
            <div className="control-group">
              <input
                className="input-field"
                placeholder="Cari tugas..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="control-group">
              <select className="select-field" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">Semua</option>
                <option value="pending">Pending</option>
                <option value="completed">Selesai</option>
              </select>
              <select className="select-field" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="createdDesc">Terbaru</option>
                <option value="createdAsc">Terlama</option>
                <option value="priority">Prioritas</option>
                <option value="dueSoon">Deadline</option>
              </select>
            </div>
          </div>

          <AnimatePresence>
            {showForm && <NewTodoForm onAdd={addTodo} />}
          </AnimatePresence>

          <ul className="todo-list">
            {visible.length === 0 && <p className="empty-message">Tidak ada tugas yang cocok.</p>}
            <AnimatePresence>
              {visible.map((todo, idx) => (
                <motion.li
                  key={todo._id}
                  draggable
                  onDragStart={(e) => onDragStart(e, idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDrop(e, idx)}
                  className="todo-list-item"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <TodoItem
                    todo={todo}
                    onToggle={() => toggleTodo(todo._id)}
                    onEdit={(patch) => updateTodo(todo._id, patch)}
                    onDelete={() => removeTodo(todo._id)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </section>

      <aside className="todo-sidebar-column">
        <div className="card sidebar-card">
          <h3 className="card-subtitle">Ringkasan</h3>
          <div className="summary-grid">
            <div>Semua tugas: <strong>{todos.length}</strong></div>
            <div>Tugas selesai: <strong>{todos.filter(t => t.completed).length}</strong></div>
            <div>Prioritas tinggi: <strong>{todos.filter(t => t.priority === 'high').length}</strong></div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.text);
  useEffect(() => setText(todo.text), [todo.text]);

  const save = () => {
    if (!text.trim()) return;
    onEdit({ text: text.trim() });
    setEditing(false);
  };

  return (
    <div className="todo-item-content">
      <button onClick={onToggle} className={`todo-checkbox ${todo.completed ? 'completed' : ''}`}>
        {todo.completed ? '✔' : '○'}
      </button>

      <div className="todo-item-details">
        {editing ? (
          <div className="edit-form">
            <input className="input-field" value={text} onChange={(e) => setText(e.target.value)} />
            <button className="button button-primary" onClick={save}>Save</button>
          </div>
        ) : (
          <div className="flex-between">
            <div>
              <div className={`todo-text ${todo.completed ? 'completed' : ''}`}>{todo.text}</div>
              <div className="todo-meta">
                {todo.due ? `Due: ${new Date(todo.due).toLocaleDateString()}` : ''} {todo.tags?.length ? ' • ' + todo.tags.join(', ') : ''}
              </div>
            </div>
            <div className="button-group">
              <button className="button button-secondary" onClick={() => setEditing(true)}>Edit</button>
              <button className="button button-danger" onClick={onDelete}>Archive</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NewTodoForm({ onAdd }) {
  const [text, setText] = useState("");
  const [due, setDue] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
    
    onAdd({ text: text.trim(), due: due || null, priority: "medium", tags }); 
    setText("");
    setDue("");
    setTagsRaw("");
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={submit}
      className="new-todo-form"
    >
      <div className="form-grid">
        <input className="input-field-span-2" placeholder="Apa yang ingin kamu kerjakan?" value={text} onChange={(e) => setText(e.target.value)} />
        
        <input type="date" className="input-field" value={due} onChange={(e) => setDue(e.target.value)} />
        <input className="input-field-span-2" placeholder="Tags (pisahkan dengan koma)" value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} />
        <div className="form-submit-group">
          <button className="button button-primary" type="submit">Tambah</button>
        </div>
      </div>
    </motion.form>
  );
}

function ArchivePage() {
  const [archive, setArchive] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArchive = async () => {
      try {
        const res = await axios.get(`${API_URL}/todos/archived`);
        setArchive(res.data);
      } catch (e) { console.error("Gagal mengambil arsip", e); }
    };
    fetchArchive();
  }, []);

  const restore = async (id) => {
    try {
      await axios.put(`${API_URL}/todos/restore/${id}`);
      setArchive(archive.filter((a) => a._id !== id));
      navigate("/");
    } catch (e) { console.error("Gagal restore todo", e); }
  };

  const clearAll = async () => {
    try {
      await axios.delete(`${API_URL}/todos/archive/clear`);
      setArchive([]);
    } catch (e) { console.error("Gagal hapus arsip", e); }
  };

  return (
    <div className="card">
      <div className="flex-between">
        <h2 className="card-title">Arsip Tugas</h2>
        <div className="button-group">
          <button className="button button-danger" onClick={clearAll}>Kosongkan Arsip</button>
        </div>
      </div>
      <ul className="todo-list">
        {archive.length === 0 && <p className="empty-message">Arsip kosong.</p>}
        {archive.map((a) => (
          <li key={a._id} className="archive-list-item">
            <div>
              <div className="todo-text">{a.text}</div>
              <div className="todo-meta">{a.due ? `Due: ${new Date(a.due).toLocaleDateString()}` : ''}</div>
            </div>
            <div className="button-group">
              <button className="button button-secondary" onClick={() => restore(a._id)}>Restore</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NotFound() {
  return (
    <div className="card text-center">
      <h3 className="card-title">404 — Halaman tidak ditemukan</h3>
      <p className="about-text">Kembali ke <Link to="/" className="link-primary">beranda</Link>.</p>
    </div>
  );
}

function sortTodos(list, mode) {
  const arr = Array.from(list);
  if (mode === "createdDesc") return arr.sort((a, b) => (new Date(b.createdAt) - new Date(a.createdAt)));
  if (mode === "createdAsc") return arr.sort((a, b) => (new Date(a.createdAt) - new Date(b.createdAt)));
  if (mode === "priority") {
    const rank = { high: 0, medium: 1, low: 2, default: 1 };
    return arr.sort((a, b) => (rank[a.priority || 'default'] - rank[b.priority || 'default']));
  }
  if (mode === "dueSoon") {
    return arr.sort((a, b) => {
        if (a.due && b.due) return new Date(a.due) - new Date(b.due);
        if (a.due) return -1;
        if (b.due) return 1;
        return 0;
    });
  }
  return arr;
}