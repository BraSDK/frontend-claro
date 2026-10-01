import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LogOut } from 'lucide-react';
import { usePerfil } from '../../hooks/usePerfil';
import { iniciales, NOMBRES_ROL } from '../../utils/formato';

export const Header = () => {
    const navigate = useNavigate();
    const { perfil } = usePerfil();
    const [busqueda, setBusqueda] = useState('');

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        navigate('/login');
    };

    // Busca una SOT: lleva a Órdenes con el filtro ya aplicado
    const buscar = (e: React.FormEvent) => {
        e.preventDefault();
        const texto = busqueda.trim();
        if (!texto) return;
        navigate(`/ordenes?buscar=${encodeURIComponent(texto)}`);
        setBusqueda('');
    };

    return (
        <header className="z-10 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">
            <form
                onSubmit={buscar}
                className="flex w-96 items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 transition-all focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100"
            >
                <Search size={18} className="text-gray-400" />
                <input
                    type="text"
                    inputMode="numeric"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar SOT y presionar Enter..."
                    className="ml-3 w-full border-none bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                />
            </form>

            <div className="flex items-center gap-6">
                <button
                    type="button"
                    onClick={() => navigate('/configuracion')}
                    className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-gray-50"
                    title="Mi perfil"
                >
                    <div className="text-right">
                        <p className="text-sm font-semibold leading-none text-gray-700">
                            {perfil?.nombreCompleto || perfil?.email || 'Cargando...'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{perfil ? NOMBRES_ROL[perfil.rol] ?? perfil.rol : ''}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-red-100 font-bold text-red-600">
                        {iniciales(perfil?.nombreCompleto || perfil?.email)}
                    </div>
                </button>

                <div className="h-8 w-px bg-gray-200" />

                <button
                    onClick={handleLogout}
                    title="Cerrar sesión"
                    className="rounded-lg p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};
