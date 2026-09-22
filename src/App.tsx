// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Auth/Login';
import { MainLayout } from './components/Layout/MainLayout';
import { ServiciosPage } from './pages/ServiciosPage';
import { OrdenesPage } from './pages/OrdenesPage/OrdenesPage';
import { OrdenesCrearPage } from './pages/OrdenesPage/OrdenesCrearPage';
import './App.css'
import { OrdenEditarByTecnico } from './pages/OrdenesPage/OrdenEditarByTecnico';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección por defecto: si entran a la raíz, los mandamos al login */}
        <Route path="/" element={<Navigate to="/login" replace/>} />

        {/* Ruta Pública (camino)*/}
        <Route path="/login" element={<Login />} />

        {/* Rutas Privadas */}
        <Route element={<MainLayout />}>
          <Route path="/servicios" element={<ServiciosPage />} />
          <Route path="/ordenes" element={<OrdenesPage />} />
          <Route path="/ordenesCrear" element={<OrdenesCrearPage />} />
          <Route path="/ordenes/:id/editar" element={<OrdenEditarByTecnico/>} />
          
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
};
export default App; //predeterminada