import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Box, Users, Settings } from 'lucide-react';

export const Sidebar = () => {
    const location = useLocation();

    // Manu de navegacion dinamico
    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Servicios', path: '/servicios', icon: <Box size={20} /> },
        { name: 'Usuarios', path: '/usuarios', icon: <Users size={20} /> },
        { name: 'Configuración', path: '/configuracion', icon: <Settings size={20} /> },
    ];

    return(
        // Fondo oscuro premium para el menú lateral
        <aside className="w-64 bg-gray-900 flex flex-col h-full shadow-2xl z-20">
        
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-gray-800">
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-red-600/30">
            <div className="w-3 h-3 bg-white rounded-sm rotate-45"></div>
        </div>
        <span className="text-xl font-bold text-white tracking-wide">
            Sistema<span className="text-red-500">Claro</span>
        </span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
            <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20' // Estado Activo: Rojo Corporativo
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'   // Estado Inactivo: Gris sutil
                }`}
            >
                {item.icon}
                {item.name}
            </Link>
            );
        })}
        </nav>
    </aside>
    )
}