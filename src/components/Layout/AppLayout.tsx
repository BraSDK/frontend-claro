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

    const botonHeader = 'flex h-9 w-9 items-center justify-center rounded-control text-on-primary transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70';

    return (
        <div className="min-h-screen bg-page">
            {/* ===== Header ===== */}
            <header className="sticky top-0 z-30 flex h-[58px] items-center justify-between gap-4 rounded-b-card bg-primary px-3 md:px-6 xl:px-[72px]">
                <div className="flex min-w-0 items-center gap-2">
                    <button type="button" onClick={atras} className={botonHeader} title="Atrás" aria-label="Atrás">
                        <ChevronLeft size={22} strokeWidth={1.75} />
                    </button>

                    {/* logo genérico del sistema (sin marca de terceros) */}
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="hidden h-8 items-center gap-2 rounded-control px-1 text-on-primary sm:flex"
                        title="Inicio"
                    >
                        <span className="flex h-7 w-7 items-center justify-center rounded-badge bg-white">
                            <span className="h-2.5 w-2.5 rotate-45 rounded-xs bg-primary" />
                        </span>
                    </button>

                    {/* título de la pantalla = menú de módulos */}
                    <div ref={refModulos} className="relative min-w-0">
                        <button
                            type="button"
                            onClick={() => setMenuModulos((v) => !v)}
                            className="flex min-w-0 items-center gap-1.5 rounded-control px-2 py-1.5 text-[18px] font-bold text-on-primary transition-colors hover:bg-white/15"
                            aria-haspopup="menu"
                            aria-expanded={menuModulos}
                        >
                            <span className="truncate">{titulo}</span>
                            <ChevronDown size={16} strokeWidth={1.75} className={`shrink-0 transition-transform ${menuModulos ? 'rotate-180' : ''}`} />
                        </button>

                        {menuModulos && (
                            <nav className="absolute left-0 top-full mt-2 w-64 overflow-hidden rounded-card bg-surface py-1.5 text-ink shadow-menu" role="menu">
                                {modulos.map((m, i) => (
                                    <div key={m.ruta}>
                                        {m.grupo && modulos[i - 1]?.grupo !== m.grupo && (
                                            <p className="mt-1 border-t border-line-soft px-4 pb-1 pt-2.5 text-xs font-semibold uppercase tracking-wide text-muted">{m.grupo}</p>
                                        )}
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => navigate(m.ruta)}
                                            className={`flex w-full items-center justify-between px-4 py-2 text-left transition-colors hover:bg-hover ${activo?.ruta === m.ruta ? 'font-semibold text-primary' : ''}`}
                                        >
                                            {m.nombre}
                                            {activo?.ruta === m.ruta && <Check size={16} />}
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
                        <form onSubmit={buscar} className="flex items-center gap-1 rounded-control bg-white/15 pl-2.5">
                            <Search size={16} className="text-on-primary" />
                            <input
                                autoFocus
                                inputMode="numeric"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Escape') setBuscando(false); }}
                                placeholder="Buscar SOT..."
                                className="h-8 w-36 bg-transparent text-on-primary placeholder:text-white/70 focus:outline-none sm:w-48"
                            />
                            <button type="button" onClick={() => setBuscando(false)} className={botonHeader} aria-label="Cerrar búsqueda">
                                <X size={16} />
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
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-avatar border-2 border-white text-sm text-avatar-ink transition hover:brightness-95"
                            title={perfil?.nombreCompleto || 'Mi cuenta'}
                            aria-haspopup="menu"
                            aria-expanded={menuUsuario}
                        >
                            {iniciales(perfil?.nombreCompleto || perfil?.email)}
                        </button>

                        {menuUsuario && (
                            <div className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-card bg-surface text-ink shadow-menu" role="menu">
                                <div className="border-b border-line-soft px-4 py-3">
                                    <p className="truncate font-semibold">{perfil?.nombreCompleto || perfil?.email || '—'}</p>
                                    <p className="text-xs text-muted">{perfil ? NOMBRES_ROL[perfil.rol] ?? perfil.rol : ''}</p>
                                </div>
                                <button type="button" role="menuitem" onClick={() => navigate('/configuracion')} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-hover">
                                    <User size={16} className="text-label" /> Mi perfil
                                </button>
                                <button type="button" role="menuitem" onClick={cerrarSesion} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-danger transition-colors hover:bg-danger-soft">
                                    <LogOut size={16} /> Cerrar sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ===== Contenido ===== */}
            <main className="px-4 py-6 md:px-10 xl:px-20">
                <Outlet />
            </main>
        </div>
    );
};
