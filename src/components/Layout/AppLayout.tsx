import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, Search, X, LogOut, User, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePerfil } from '../../hooks/usePerfil';
import { iniciales, NOMBRES_ROL } from '../../utils/formato';
import { MODULOS, moduloActivo, tituloDeRuta } from './modulos';

// Cierra un menú al hacer click fuera de él o con Escape
const useCerrarFuera = (abierto: boolean, cerrar: () => void) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!abierto) return;
        const click = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) cerrar(); };
        const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrar(); };
        document.addEventListener('mousedown', click);
        document.addEventListener('keydown', tecla);
        return () => { document.removeEventListener('mousedown', click); document.removeEventListener('keydown', tecla); };
    }, [abierto, cerrar]);
    return ref;
};

export const AppLayout = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { esTecnico } = useAuth();
    const { perfil } = usePerfil();

    const [menuModulos, setMenuModulos] = useState(false);
    const [menuUsuario, setMenuUsuario] = useState(false);
    const [buscando, setBuscando] = useState(false);
    const [busqueda, setBusqueda] = useState('');

    const refModulos = useCerrarFuera(menuModulos, () => setMenuModulos(false));
    const refUsuario = useCerrarFuera(menuUsuario, () => setMenuUsuario(false));

    // al cambiar de pantalla se cierran los menús
    useEffect(() => { setMenuModulos(false); setMenuUsuario(false); }, [pathname]);

    const modulos = MODULOS.filter((m) => !(m.soloGestion && esTecnico));
    const activo = moduloActivo(pathname);
    const titulo = tituloDeRuta(pathname);

    const atras = () => (window.history.length > 1 ? navigate(-1) : navigate('/dashboard'));

    const buscar = (e: React.FormEvent) => {
        e.preventDefault();
        const texto = busqueda.trim();
        if (!texto) return;
        navigate(`/ordenes?buscar=${encodeURIComponent(texto)}`);
        setBusqueda('');
        setBuscando(false);
    };

    const cerrarSesion = () => {
        localStorage.removeItem('jwt_token');
        navigate('/login');
    };

    const botonHeader = 'flex h-10 w-10 items-center justify-center rounded-pill text-label transition-colors hover:bg-hover hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary';
    const claseMenu = 'absolute top-full mt-2 overflow-hidden rounded-mid border border-line bg-surface text-ink shadow-menu';

    return (
        <div className="min-h-screen bg-page">
            {/* ===== Barra superior: blanca, a todo el ancho ===== */}
            <header className="sticky top-0 z-30 border-b border-line bg-surface">
                <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 md:px-6">
                    <div className="flex min-w-0 items-center gap-1.5">
                        <button type="button" onClick={atras} className={botonHeader} title="Atrás" aria-label="Atrás">
                            <ChevronLeft size={20} strokeWidth={1.75} />
                        </button>

                        {/* logo genérico del sistema (sin marca de terceros) */}
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-brand sm:flex"
                            title="Inicio"
                            aria-label="Inicio"
                        >
                            <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-white" />
                        </button>

                        {/* título de la pantalla = menú de módulos */}
                        <div ref={refModulos} className="relative min-w-0">
                            <button
                                type="button"
                                onClick={() => setMenuModulos((v) => !v)}
                                className="flex min-w-0 items-center gap-1.5 rounded-pill px-3 py-2 text-lg font-semibold text-ink transition-colors hover:bg-hover"
                                aria-haspopup="menu"
                                aria-expanded={menuModulos}
                            >
                                <span className="truncate">{titulo}</span>
                                <ChevronDown size={16} strokeWidth={1.75} className={`shrink-0 text-label transition-transform ${menuModulos ? 'rotate-180' : ''}`} />
                            </button>

                            {menuModulos && (
                                <nav className={`${claseMenu} left-0 w-64 p-1.5`} role="menu">
                                    {modulos.map((m, i) => (
                                        <div key={m.ruta}>
                                            {m.grupo && modulos[i - 1]?.grupo !== m.grupo && (
                                                <p className="mt-1 border-t border-line px-3 pb-1 pt-2.5 text-xs font-semibold uppercase tracking-wide text-label">{m.grupo}</p>
                                            )}
                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={() => navigate(m.ruta)}
                                                className={`flex w-full items-center justify-between rounded-control px-3 py-2 text-left text-sm transition-colors ${activo?.ruta === m.ruta ? 'bg-primary-soft font-semibold text-primary' : 'hover:bg-hover'}`}
                                            >
                                                {m.nombre}
                                                {activo?.ruta === m.ruta && <Check size={16} strokeWidth={2} />}
                                            </button>
                                        </div>
                                    ))}
                                </nav>
                            )}
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        {/* búsqueda de SOT */}
                        {buscando ? (
                            <form onSubmit={buscar} className="flex h-10 items-center gap-1.5 rounded-pill bg-page pl-4 pr-1 focus-within:ring-2 focus-within:ring-primary">
                                <Search size={16} strokeWidth={1.75} className="text-label" />
                                <input
                                    autoFocus
                                    inputMode="numeric"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Escape') setBuscando(false); }}
                                    placeholder="Buscar SOT..."
                                    className="w-32 bg-transparent text-sm text-ink focus:outline-none sm:w-44"
                                />
                                <button type="button" onClick={() => setBuscando(false)} className="flex h-8 w-8 items-center justify-center rounded-pill text-label hover:bg-surface hover:text-ink" aria-label="Cerrar búsqueda">
                                    <X size={16} strokeWidth={1.75} />
                                </button>
                            </form>
                        ) : (
                            <button type="button" onClick={() => setBuscando(true)} className={botonHeader} title="Buscar SOT" aria-label="Buscar">
                                <Search size={18} strokeWidth={1.75} />
                            </button>
                        )}

                        {/* avatar y menú del usuario */}
                        <div ref={refUsuario} className="relative">
                            <button
                                type="button"
                                onClick={() => setMenuUsuario((v) => !v)}
                                className="flex h-10 w-10 items-center justify-center rounded-pill bg-avatar text-sm font-semibold text-avatar-ink transition hover:ring-2 hover:ring-primary-soft hover:ring-offset-2"
                                title={perfil?.nombreCompleto || 'Mi cuenta'}
                                aria-haspopup="menu"
                                aria-expanded={menuUsuario}
                            >
                                {iniciales(perfil?.nombreCompleto || perfil?.email)}
                            </button>

                            {menuUsuario && (
                                <div className={`${claseMenu} right-0 w-64`} role="menu">
                                    <div className="border-b border-line px-4 py-3">
                                        <p className="truncate font-semibold">{perfil?.nombreCompleto || perfil?.email || '—'}</p>
                                        <p className="text-xs text-label">{perfil ? NOMBRES_ROL[perfil.rol] ?? perfil.rol : ''}</p>
                                    </div>
                                    <div className="p-1.5">
                                        <button type="button" role="menuitem" onClick={() => navigate('/configuracion')} className="flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-left text-sm transition-colors hover:bg-hover">
                                            <User size={16} strokeWidth={1.75} className="text-label" /> Mi perfil
                                        </button>
                                        <button type="button" role="menuitem" onClick={cerrarSesion} className="flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-danger-soft">
                                            <LogOut size={16} strokeWidth={1.75} /> Cerrar sesión
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ===== Contenido: centrado a 1200px ===== */}
            <main className="mx-auto max-w-[1200px] px-4 py-6 md:px-6 md:py-8">
                <Outlet />
            </main>
        </div>
    );
};
