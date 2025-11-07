import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// import { v4 as uuidv4 } from "uuid"; // Kita pakai _id dari MongoDB
import axios from "axios"; // <-- IMPORT AXIOS

// URL Backend kita
const API_URL = "http://localhost:5000"; 

export default function TodoAppEnhanced() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <TopNav />
          <main className="mt-8">
            <Routes>
              {/* Kita perlu passing data, jadi kita render di sini */}
              <Route path="/" element={<TodoPage />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

// ... (Komponen TopNav, NavLink, AboutPage, NotFound tidak berubah) ...
// (Saya singkat agar tidak terlalu panjang, salin saja dari file asli Anda)
function TopNav() {
  return (
    <nav className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-400 rounded-xl shadow-lg flex items-center justify-center text-white font-bold">TL</div>
        <div>
          <h1 className="text-2xl font-semibold">TodoLux</h1>
          <p className="text-sm text-slate-500">Buat, kelola, dan gerakkan tugasmu dengan gaya</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/archive">Archive</NavLink>
        <NavLink to="/about">About</NavLink>
      </div>
    </nav>
  );
}
function NavLink({ to, children }) {
  return (
    <Link to={to} className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100">
      {children}
    </Link>
  );
}
function AboutPage() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-lg font-semibold">Tentang TodoLux</h2>
      <p className="mt-3 text-slate-600">Aplikasi To-do modern dengan fitur: drag-to-reorder, archive, filter, sort, due date, tags, dan multi-page routing. Dibangun untuk menjadi cantik sekaligus produktif.</p>
    </div>
  );
}
function NotFound() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
      <h3 className="text-xl font-semibold">404 — Halaman tidak ditemukan</h3>
      <p className="mt-3 text-slate-500">Kembali ke <Link to="/" className="text-indigo-600">beranda</Link>.</p>
    </div>
  );
}


/* ------------------------- Todo Page (DIUBAH) ------------------------- */
function TodoPage() {
  const [todos, setTodos] = useState([]); // <-- Ganti dari useLocalStorage
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdDesc");
  const [showForm, setShowForm] = useState(true);

  // (READ) Ambil data dari DB saat memuat
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await axios.get(`${API_URL}/todos`);
        setTodos(sortTodos(res.data, sortBy)); // Sort data yang diambil
      } catch (e) {
        console.error("Gagal mengambil todos", e);
      }
    };
    fetchTodos();
  }, [sortBy]); // <-- SortBy tetap di sini agar list di-sort ulang saat berubah

  const pendingCount = todos.filter((t) => !t.completed).length;

  // (CREATE) Kirim data ke DB
  const addTodo = async (payload) => {
    try {
      // Kirim data (tanpa _id, createdAt)
      const res = await axios.post(`${API_URL}/todos`, {
        text: payload.text,
        due: payload.due || null,
        priority: payload.priority || "medium",
        tags: payload.tags || [],
      });
      // Tambahkan data baru (dari DB) ke state
      setTodos([res.data, ...todos]);
    } catch (e) {
      console.error("Gagal menambah todo", e);
    }
  };

  // (UPDATE) Kirim patch ke DB
  const updateTodo = async (id, patch) => {
    try {
      // Kirim patch (text, priority, dll)
      const res = await axios.put(`${API_URL}/todos/${id}`, patch);
      setTodos(todos.map((t) => (t._id === id ? res.data : t)));
    } catch (e) {
      console.error("Gagal update todo", e);
    }
  };

  // (UPDATE) Toggle complete
  const toggleTodo = async (id) => {
      try {
          const res = await axios.put(`${API_URL}/todos/toggle/${id}`);
          setTodos(todos.map((t) => (t._id === id ? res.data : t)));
      } catch (e) {
          console.error("Gagal toggle todo", e);
      }
  }

  // (UPDATE) Arsipkan todo
  const removeTodo = async (id) => {
    try {
      await axios.put(`${API_URL}/todos/archive/${id}`);
      setTodos(todos.filter((t) => t._id !== id)); // Hapus dari list aktif
    } catch (e) {
      console.error("Gagal mengarsip todo", e);
    }
  };

  // (UPDATE) Arsipkan semua yang selesai
  const clearCompleted = async () => {
    try {
      await axios.post(`${API_URL}/todos/archive/completed`);
      setTodos(todos.filter((t) => !t.completed)); // Hapus dari list
    } catch (e) {
      console.error("Gagal arsip completed", e);
    }
  };

  // ... (Logika Drag/Drop, Filter, Sort tidak berubah) ...
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


  // Tampilan JSX (Hampir tidak berubah, hanya onToggle yang disesuaikan)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <section className="lg:col-span-2">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          {/* ... (Bagian Header, Filter, Sort) ... */}
          {/* Ini semua SAMA PERSIS seperti file Anda */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">My Tasks</h2>
              <p className="text-sm text-slate-500">{pendingCount} tugas belum selesai — buat hari ini terasa produktif ✨</p>
            </div>
            <div className="flex gap-2 items-center">
              <button
                className="px-3 py-2 bg-slate-100 rounded-md text-sm"
                onClick={() => setShowForm((s) => !s)}
              >
                {showForm ? "Sembunyikan" : "Tambah tugas"}
              </button>
              <button className="px-3 py-2 bg-red-50 text-red-600 rounded-md text-sm" onClick={clearCompleted}>
                Arsipkan selesai
              </button>
    _       </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <input
                className="flex-1 px-3 py-2 border rounded-md"
                placeholder="Cari tugas..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-center">
              <select className="px-3 py-2 border rounded-md" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">Semua</option>
                <option value="pending">Pending</option>
                <option value="completed">Selesai</option>
              </select>
              <select className="px-3 py-2 border rounded-md" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="createdDesc">Terbaru</option>
                <option value="createdAsc">Terlama</option>
        _       <option value="priority">Prioritas</option>
                <option value="dueSoon">Deadline</option>
              </select>
            </div>
          </div>
          <AnimatePresence>
            {showForm && <NewTodoForm onAdd={addTodo} />}
          </AnimatePresence>

          <ul className="mt-6 divide-y">
      _     {visible.length === 0 && <p className="p-6 text-slate-500 italic">Tidak ada tugas yang cocok.</p>}
            {visible.map((todo, idx) => (
              <li
                key={todo._id}
                draggable
                onDragStart={(e) => onDragStart(e, idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, idx)}
                className="py-4"
              >
                <TodoItem
                  todo={todo}
                  onToggle={() => toggleTodo(todo._id)} // <-- Ganti ke fungsi toggle baru
                  onEdit={(patch) => updateTodo(todo._id, patch)}
                  onDelete={() => removeTodo(todo._id)}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
      {/* ... (Bagian Aside/Sidebar) ... */}
      <aside className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-6">
          <h3 className="font-semibold">Ringkasan</h3>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <div>Semua tugas: <strong>{todos.length}</strong></div>
            <div>Tugas selesai: <strong>{todos.filter(t => t.completed).length}</strong></div>
            <div>Prioritas tinggi: <strong>{todos.filter(t => t.priority === 'high').length}</strong></div>
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-medium">Tips</h4>
            <p className="text-xs text-slate-500 mt-2">Klik dan seret tugas untuk mengurutkan ulang. Gunakan filter dan sort untuk menemukan tugas dengan cepat.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ... (Komponen TodoItem dan NewTodoForm tidak berubah dari file Anda) ...
// (Saya singkat agar tidak terlalu panjang, salin saja dari file asli Anda)
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
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className={`flex items-start gap-4`}
    >
      <button onClick={onToggle} className={`w-9 h-9 rounded-lg flex items-center justify-center border ${todo.completed ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
        {todo.completed ? '✔' : '○'}
      </button>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-4">
          {editing ? (
            <div className="flex gap-2 w-full">
              <input className="flex-1 px-3 py-2 border rounded-md" value={text} onChange={(e) => setText(e.target.value)} />
              <button className="px-3 py-2 bg-blue-600 text-white rounded-md" onClick={save}>Save</button>
            </div>
          ) : (
            <div className="flex items-start justify-between w-full">
              <div>
                <div className={`font-medium ${todo.completed ? 'line-through text-slate-400' : ''}`}>{todo.text}</div>
                <div className="text-xs text-slate-500 mt-1">{todo.due ? `Due: ${new Date(todo.due).toLocaleDateString()}` : ''} {todo.tags?.length ? ' • ' + todo.tags.join(', ') : ''}</div>
	          </div>
              <div className="flex items-center gap-2">
                <button className="text-sm px-2 py-1 border rounded-md" onClick={() => setEditing(true)}>Edit</button>
                <button className="text-sm px-2 py-1 bg-red-50 text-red-600 rounded-md" onClick={onDelete}>Archive</button>
              </div>
            </div>
          )}
        </div>
      </div>
  	</motion.div>
  );
}
function NewTodoForm({ onAdd }) {
  const [text, setText] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState("medium");
  const [tagsRaw, setTagsRaw] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onAdd({ text: text.trim(), due: due || null, priority, tags });
    setText("");
    setDue("");
    setTagsRaw("");
    setPriority("medium");
  };
  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={submit}
      className="mt-4 bg-slate-50 p-4 rounded-lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="md:col-span-2 px-3 py-2 border rounded-md" placeholder="Apa yang ingin kamu kerjakan?" value={text} onChange={(e) => setText(e.target.value)} />
        <select className="px-3 py-2 border rounded-md" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input type="date" className="px-3 py-2 border rounded-md md:col-span-1" value={due} onChange={(e) => setDue(e.target.value)} />
        <input className="px-3 py-2 border rounded-md md:col-span-2" placeholder="Tags (pisahkan dengan koma)" value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} />
        <div className="md:col-span-3 flex justify-end">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md" type="submit">Tambah</button>
        </div>
      </div>
    </motion.form>
  );
}


/* ------------------------- Archive Page (DIUBAH) ------------------------- */
function ArchivePage() {
  const [archive, setArchive] = useState([]); // <-- Ganti dari useLocalStorage
  const navigate = useNavigate();

  // (READ) Ambil data arsip dari DB
  useEffect(() => {
    const fetchArchive = async () => {
      try {
        const res = await axios.get(`${API_URL}/todos/archived`);
        setArchive(res.data);
      } catch (e) {
        console.error("Gagal mengambil arsip", e);
      }
    };
    fetchArchive();
  }, []);

  // (UPDATE) Kembalikan arsip ke daftar todo
  const restore = async (id) => {
    try {
      await axios.put(`${API_URL}/todos/restore/${id}`);
      setArchive(archive.filter((a) => a._id !== id)); // Hapus dari state arsip
      navigate("/"); // Pindah ke halaman utama
    } catch (e) {
      console.error("Gagal restore todo", e);
    }
  };

  // (DELETE) Hapus semua arsip
  const clearAll = async () => {
    try {
      await axios.delete(`${API_URL}/todos/archive/clear`);
      setArchive([]); // Kosongkan state
    } catch (e) {
      console.error("Gagal hapus arsip", e);
    }
  };

  // Tampilan JSX (Tidak berubah)
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Arsip Tugas</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-red-50 text-red-600 rounded-md" onClick={clearAll}>Kosongkan Arsip</button>
        </div>
      </div>
      <ul className="mt-4 divide-y">
        {archive.length === 0 && <p className="p-6 text-slate-500 italic">Arsip kosong.</p>}
        {archive.map((a) => (
          <li key={a._id} className="py-3 flex items-center justify-between gap-3">
  	      <div>
              <div className="font-medium">{a.text}</div>
  	          <div className="text-xs text-slate-500">{a.due ? `Due: ${new Date(a.due).toLocaleDateString()}` : ''}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm border rounded-md" onClick={() => restore(a._id)}>Restore</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


/* ------------------------- Small helpers (DIHAPUS) ------------------------- */
// Kita tidak perlu useLocalStorage atau getFromLocalStorage lagi
// Fungsi sortTodos kita biarkan
function sortTodos(list, mode) {
  const arr = Array.from(list);
  if (mode === "createdDesc") return arr.sort((a, b) => (new Date(b.createdAt) - new Date(a.createdAt)));
  if (mode === "createdAsc") return arr.sort((a, b) => (new Date(a.createdAt) - new Date(b.createdAt)));
  if (mode === "priority") {
    const rank = { high: 0, medium: 1, low: 2, default: 1 };
    // Tambah default untuk menghindari error jika prioritas null
    return arr.sort((a, b) => (rank[a.priority || 'default'] - rank[b.priority || 'default']));
  }
  if (mode === "dueSoon") {
    // Perbaiki logika sort: null/undefined due date harus di akhir
    return arr.sort((a, b) => {
        if (a.due && b.due) return new Date(a.due) - new Date(b.due);
        if (a.due) return -1; // a punya due date, b tidak. a duluan.
        if (b.due) return 1;  // b punya due date, a tidak. b duluan.
        return 0; // Keduanya tidak punya due date
    });
  }
  return arr;
}