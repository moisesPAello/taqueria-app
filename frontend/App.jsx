import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/index.css';

// Importar páginas (se crearán después)
const MeseroPage = () => <div>Vista Mesero</div>;
const AdminPage = () => <div>Vista Administrador</div>;
const LoginPage = () => <div>Página de Login</div>;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/mesero" element={<MeseroPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
