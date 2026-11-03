import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { validarPermiso, type Permiso } from '../../utils/permisos';


export const RutaProtegida = ({ permiso }: { permiso: Permiso }) => {
    const { rol } = useAuth();
    return validarPermiso(rol, permiso) ? <Outlet /> : <Navigate to="/inicio" replace />;
}
