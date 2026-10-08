import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Aula from './pages/Aula';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import CambiarPasswordObligatorio from './pages/CambiarPasswordObligatorio';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/aula"
        element={
          <ProtectedRoute rol="ALUMNO">
            <Aula />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute rol="ADMIN">
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cambiar-password"
        element={
          <ProtectedRoute>
            <CambiarPasswordObligatorio />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
