// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Auth/Login';
import { MainLayout } from './components/Layout/MainLayout';
import { ServiciosPage } from './pages/ServiciosPage';

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
          {/* Aquí irán <Route path="/usuarios" element={<UsuariosPage />} /> */}

        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default App; //predeterminada