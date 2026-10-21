// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Auth/Login';
import { AppLayout } from './components/Layout/AppLayout';
import { ServiciosPage } from './pages/ServiciosPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { OrdenesPage } from './pages/OrdenesPage/OrdenesPage';
import { OrdenesCrearPage } from './pages/OrdenesPage/OrdenesCrearPage';
import { OrdenEditarByTecnico} from './pages/OrdenesPage/OrdenEditarByTecnico';
import { EditarOrdenPage } from './pages/OrdenesPage/EditarOrdenPage';
import { EditarDetallesPage } from './pages/OrdenesPage/EditarDetallesPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuditarSotPage } from './pages/OrdenesPage/AuditarSotPage';
import { ConciliacionPage } from './pages/ConciliacionPage';
import { ProximamentePage } from './pages/ProximamentePage';
import { ConfiguracionPage } from './pages/ConfiguracionPage';
import { LiquidacionPage } from './pages/LiquidacionPage';
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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/configuracion" element={<ConfiguracionPage />} />
          <Route path="/conciliacion" element={<ConciliacionPage />} />
          <Route path="/liquidacion" element={<LiquidacionPage/>}/>
          <Route path="/valorizacion" element={<ProximamentePage titulo="Valorización almacén" descripcion="Aquí se verá la valorización de cada SOT por servicio, adicionales y drops. Mientras tanto, los montos están en Órdenes de trabajo y en la conciliación." atajo={{ texto: 'Ir a la conciliación', ruta: '/conciliacion' }} />} />
          <Route path="/pagos-claro" element={<ProximamentePage titulo="Pagos Claro" descripcion="Cuando tengan el reporte de pagos de Claro, aquí se importará y la conciliación lo usará en lugar de la auditoría." atajo={{ texto: 'Ir a la conciliación', ruta: '/conciliacion' }} />} />
          <Route path="/reportes" element={<ProximamentePage titulo="Reportes" descripcion="Reportes descargables por periodo, técnico y servicio. Por ahora puedes exportar las diferencias desde la conciliación y ver los totales en Inicio." atajo={{ texto: 'Ir a Inicio', ruta: '/dashboard' }} />} />
          <Route path="/servicios" element={<ServiciosPage />} />
          <Route path="/ordenes" element={<OrdenesPage />} />
          <Route path="/ordenesCrear" element={<OrdenesCrearPage />} />
          <Route path="/ordenes/:id/editar" element={<OrdenEditarByTecnico/>} />
          <Route path="/ordenes/:id/editarCompleto" element={<EditarOrdenPage  />} />
          <Route path="/ordenes/:id/detalles" element={<EditarDetallesPage />} />
          <Route path="/ordenes/:id/auditar" element={<AuditarSotPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />

        </Route>
        
      </Routes>
    </BrowserRouter>
  );
};
export default App; //predeterminada