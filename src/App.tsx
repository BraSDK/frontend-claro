// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Auth/Login';
import { AppLayout } from './components/Layout/AppLayout';
import { ServiciosPage } from './pages/ServiciosPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { OrdenesPage } from './pages/OrdenesPage/OrdenesPage';
import { OrdenesCrearPage } from './pages/OrdenesPage/OrdenesCrearPage';
import { OrdenEditarPage } from './pages/OrdenesPage/OrdenEditarPage';
import { DashboardPage } from './pages/DashboardPage';
import { InicioPage } from './pages/InicioPage';
import { ConciliacionPage } from './pages/ConciliacionPage';
import { ConfiguracionPage } from './pages/ConfiguracionPage';
import { LiquidacionPage } from './pages/LiquidacionPage';
import { AuditoriaPage } from './pages/AuditoriaPage';
import { PagosClaroPage } from './pages/PagosClaroPage';
import { ReportesPage } from './pages/ReportesPage';
import { RutaProtegida } from './components/Auth/RutaProtegida';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección por defecto: si entran a la raíz, los mandamos al login */}
        <Route path="/" element={<Navigate to="/login" replace/>} />

        {/* Ruta Pública (camino)*/}
        <Route path="/login" element={<Login />} />

        {/* Rutas Privadas */}
        <Route element={<AppLayout />}>
          <Route path="/inicio" element={<InicioPage />} /> {/* pantalla principal, acceso todos */}
          <Route path="/dashboard" element={<DashboardPage />} /> {/* acceso todos */}
          <Route path="/configuracion" element={<ConfiguracionPage />} /> {/* acceso todos */}
          <Route element={<RutaProtegida permiso="gestionarUsuarios"/>}>
            <Route path="/usuarios" element={<UsuariosPage />} />
          </Route>
          <Route element={<RutaProtegida permiso="verLiquidacion"/>}>
            <Route path="/liquidacion" element={<LiquidacionPage/>}/>
          </Route>
          <Route element={<RutaProtegida permiso="verAuditoria"/>}>
            <Route path="/auditoria" element={<AuditoriaPage />} />
          </Route>
          <Route element={<RutaProtegida permiso='verReportes'/>}>
            <Route path="/reportes" element={<ReportesPage />} />
          </Route>
          <Route element={<RutaProtegida permiso="verPagosClaro"/>}>
            <Route path="/pagos-claro" element={<PagosClaroPage />} />
          </Route>
          <Route element={<RutaProtegida permiso="gestionarServicios"/>}>
            <Route path="/servicios" element={<ServiciosPage />} />
          </Route>
          <Route path="/ordenes" element={<OrdenesPage />} />
          <Route path="/ordenes/nueva" element={<OrdenesCrearPage />} />
          <Route path="/ordenes/:sot/editar" element={<OrdenEditarPage />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
};
export default App; //predeterminada