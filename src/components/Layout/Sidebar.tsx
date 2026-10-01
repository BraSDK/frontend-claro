import { Link, useLocation } from 'react-router-dom';
import {
    Home, ClipboardList, PackageOpen, CircleDollarSign, RefreshCw, BarChart3, Settings, Box, Users, FileCheck2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface ItemMenu {
    name: string;
    path: string;
    icon: React.ReactNode;
    soloGestion?: boolean;   // solo ADMIN y ALMACÉN
}

// Menú de navegación
const principal: ItemMenu[] = [
    { name: 'Inicio', path: '/dashboard', icon: <Home size={19} /> },
    { name: 'Órdenes de trabajo', path: '/ordenes', icon: <ClipboardList size={19} /> },
    { name: 'Valorización almacén', path: '/valorizacion', icon: <PackageOpen size={19} />, soloGestion: true },
    { name: 'Pagos Claro', path: '/pagos-claro', icon: <CircleDollarSign size={19} />, soloGestion: true },
    { name: 'Conciliación de pagos', path: '/conciliacion', icon: <RefreshCw size={19} />, soloGestion: true },
    { name: 'Reportes', path: '/reportes', icon: <BarChart3 size={19} />, soloGestion: true },
    { name: 'Configuración', path: '/configuracion', icon: <Settings size={19} /> },
];

const administracion: ItemMenu[] = [
    { name: 'Servicios', path: '/servicios', icon: <Box size={19} />, soloGestion: true },
    { name: 'Usuarios', path: '/usuarios', icon: <Users size={19} />, soloGestion: true },
];

export const Sidebar = () => {
    const location = useLocation();
    const { esTecnico } = useAuth();

    const visibles = (items: ItemMenu[]) => items.filter((i) => !(i.soloGestion && esTecnico));

    const Enlace = ({ item }: { item: ItemMenu }) => {
        // también queda activo en las subrutas (ej. /ordenes/5/detalles marca "Órdenes")
        const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
        return (
            <Link
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>{item.icon}</span>
                {item.name}
            </Link>
        );
    };

    const admin = visibles(administracion);

    return (
        <aside className="z-20 flex h-full w-60 shrink-0 flex-col border-r border-slate-200/80 bg-white">
            {/* Logo */}
            <div className="flex h-20 items-center gap-3 px-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-600/30">
                    <div className="h-3 w-3 rotate-45 rounded-sm bg-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900">
                    Sistema<span className="text-blue-600">Claro</span>
                </span>
            </div>

            {/* Navegación */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {visibles(principal).map((item) => <Enlace key={item.path} item={item} />)}

                {admin.length > 0 && (
                    <>
                        <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Administración</p>
                        {admin.map((item) => <Enlace key={item.path} item={item} />)}
                    </>
                )}
            </nav>

            {/* Tarjeta informativa */}
            <div className="m-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <FileCheck2 size={20} />
                </div>
                <p className="text-sm font-semibold text-slate-800">Todo en un solo lugar</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Valida, compara y gestiona los pagos de Claro de forma rápida y segura.
                </p>
            </div>
        </aside>
    );
};
