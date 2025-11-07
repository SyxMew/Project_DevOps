import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // <-- Import Tailwind CSS
import TodoAppEnhanced from './App'; // Ganti nama impor

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <TodoAppEnhanced />
  </React.StrictMode>
);