import React, { useEffect, useState, useRef } from "react";
import axios from 'axios'; // <-- DI-IMPORT KEMBALI
import './App.css'; 

// URL backend Anda (sesuai port di docker-compose.yml)
const API_URL = 'http://localhost:5000';

export default function App() {
  // const [page, setPage] = useState("home"); // Dihapus, kita tidak perlu halaman terpisah
  const [todos, setTodos] = useState([]); // Akan diisi dari database
  // const [archive, setArchive] = useState(...); // Dihapus, kita pakai delete
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("baru");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light"); // Biarkan theme di localStorage

  // (READ) Ambil data dari database saat pertama kali memuat
  useEffect(() => {
    fetchTodos();
  }, []);

  // Efek untuk theme (ini tetap, tidak apa-apa)
  useEffect(() => { 
    localStorage.setItem("theme", theme); 
    document.documentElement.setAttribute("data-theme", theme); 
  }, [theme]);
  
  // (READ) Fungsi untuk mengambil data dari backend
  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API_URL}/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error("Error mengambil todos:", error);
    }
  };

  // (CREATE) Fungsi untuk menambah data ke backend
  const addTodo = async (text) => {
    if (!text.trim()) return;
    try {
      const response = await axios.post(`${API_URL}/todos`, { text: text });
      setTodos([response.data, ...todos]); // Tambah data baru ke state
    } catch (error) {
      console.error("Error menambah todo:", error);
    }
  };

  // (UPDATE) Fungsi untuk toggle status "done" di backend
  const toggle = async (id) => {
    try {
      const response = await axios.put(`${API_URL}/todos/${id}`);
      setTodos(todos.map(t => 
        t._id === id ? response.data : t // Gunakan _id dari MongoDB
      ));
    } catch (error) {
      console.error("Error update todo:", error);
    }
  };

  // (DELETE) Fungsi untuk menghapus todo dari backend
  // Menggantikan fungsi "archiveTodo"
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      setTodos(todos.filter(t => t._id !== id)); // Gunakan _id dari MongoDB
    } catch (error) {
      console.error("Error menghapus todo:", error);
    }
  };

  // const dragIndex = useRef(null); // Fitur drag/drop kita nonaktifkan dulu
  // const onDrop = (e, i) => { ... };

  // Logika filter (sudah benar, tapi kita ganti 'id' ke '_id' dan 'done' ke 'completed')
  let list = todos.filter(t => t.text.toLowerCase().includes(query.toLowerCase()));
  if (filter === "done") list = list.filter(t => t.completed);
  if (filter === "todo") list = list.filter(t => !t.completed);
  if (sort === "baru") list = [...list].sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)); // Sort pakai tanggal DB
  if (sort === "lama") list = [...list].sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="app">
      <header>
        <h1>TodoLux</h1>
        <nav>
          {/* Kita hapus tombol "Beranda" dan "Arsip" */}
          <button className="mode" onClick={()=>setTheme(theme==="dark"?"light":"dark")}>{theme==="dark"?"🌙":"☀️"}</button>
        </nav>
      </header>

      <main>
        <AddTask addTodo={addTodo} />
        <div className="control">
          <input placeholder="Cari tugas..." value={query} onChange={e=>setQuery(e.target.value)} />
          <select value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="all">Semua</option><option value="todo">Belum selesai</option><option value="done">Selesai</option>
          </select>
          <select value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="baru">Baru</option><option value="lama">Lama</option>
          </select>
        </div>

        <ul>
          {list.map((t,i)=>(
            <li key={t._id} // Gunakan _id dari MongoDB
              // draggable // Fitur drag/drop dinonaktifkan
              // onDragStart={()=>dragIndex.current=i}
              // onDragOver={e=>e.preventDefault()}
              // onDrop={e=>onDrop(e,i)}
              className={t.completed ? "done" : ""} // Gunakan 'completed' dari model DB
            >
              <span onClick={()=>toggle(t._id)}>{t.completed?"✔":"○"}</span>
              <p>{t.text}</p>
              {/* Ganti tombol "Arsip" menjadi "Hapus" */}
              <button onClick={()=>deleteTodo(t._id)}>Hapus</button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

function AddTask({ addTodo }) {
  const [text, setText] = useState("");
  return (
    <form onSubmit={e=>{e.preventDefault(); addTodo(text); setText("");}} className="add">
      <input value={text} onChange={e=>setText(e.target.value)} placeholder="Tulis tugas baru..." />
      <button>Tambah</button>
    </form>
  );
}