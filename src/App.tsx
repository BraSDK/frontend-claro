// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Auth/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección por defecto: si entran a la raíz, los mandamos al login */}
        <Route path="/" element={<Navigate to="/login" replace/>} />

        {/* Ruta Pública (camino)*/}
        <Route path="/login" element={<Login />} />

        {/* Ruta Privada (Temporalmente pública para probar) */}
        <Route
          path="/servicios"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <h1 className="text-3xl font-bold text-gray-800">
                ¡Bienvenido a la vista de Servicios!
              </h1>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
export default App; //predeterminada