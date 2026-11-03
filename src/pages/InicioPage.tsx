import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, ClipboardList, Warehouse, Banknote, Scale, FileSpreadsheet, ShieldCheck,
    BarChart3, Settings, Wrench, Users, GripVertical, RotateCcw, type LucideIcon,
} from 'lucide-react';
import { MODULOS, type Modulo } from '../components/Layout/modulos';
import { validarPermiso } from '../utils/permisos';
import { useAuth } from '../hooks/useAuth';

// Ícono, color y una línea de ayuda por módulo (la clave es la ruta del módulo)
const APARIENCIA: Record<string, { icono: LucideIcon; color: string; descripcion: string }> = {
    '/dashboard': { icono: LayoutDashboard, color: 'bg-info-soft text-info', descripcion: 'Producción y montos del mes' },
    '/ordenes': { icono: ClipboardList, color: 'bg-primary/10 text-primary', descripcion: 'SOTs registradas por los técnicos' },
    '/liquidacion': { icono: FileSpreadsheet, color: 'bg-success-soft text-success', descripcion: 'Hoja de liquidaciones por SOT' },
    '/auditoria': { icono: ShieldCheck, color: 'bg-warning-soft text-warning', descripcion: 'Comparar pagos de Claro' },
    '/conciliacion': { icono: Scale, color: 'bg-info-soft text-info', descripcion: 'Diferencias entre lo cobrado y lo pagado' },
    '/valorizacion': { icono: Warehouse, color: 'bg-success-soft text-success', descripcion: 'Valorización de almacén' },
    '/pagos-claro': { icono: Banknote, color: 'bg-warning-soft text-warning', descripcion: 'Pagos y multas de Claro' },
    '/reportes': { icono: BarChart3, color: 'bg-info-soft text-info', descripcion: 'Reportes por periodo' },
    '/servicios': { icono: Wrench, color: 'bg-primary/10 text-primary', descripcion: 'Catálogo y precios de servicios' },
    '/usuarios': { icono: Users, color: 'bg-info-soft text-info', descripcion: 'Cuentas, roles y contraseñas' },
    '/configuracion': { icono: Settings, color: 'bg-hover text-label', descripcion: 'Tu perfil y preferencias' },
};

// El orden elegido se guarda en este navegador, uno por usuario
const claveOrden = (usuarioId?: number) => `inicio-orden-${usuarioId ?? 'anonimo'}`;

const leerOrden = (clave: string): string[] => {
    try { return JSON.parse(localStorage.getItem(clave) ?? '[]'); } catch { return []; }
};

const guardarOrden = (clave: string, orden: string[] | null) => {
    try {
        if (orden) localStorage.setItem(clave, JSON.stringify(orden));
        else localStorage.removeItem(clave);
    } catch { /* sin almacenamiento: el orden vale solo mientras la página esté abierta */ }
};

// Los módulos permitidos, en el orden guardado; los que no estén en el orden guardado van al final
const ordenar = (modulos: Modulo[], orden: string[]) => {
    const posicion = (ruta: string) => { const i = orden.indexOf(ruta); return i === -1 ? Infinity : i; };
    return [...modulos].sort((a, b) => posicion(a.ruta) - posicion(b.ruta));
};

// Pantalla principal: un botón grande por módulo. Se pueden arrastrar para cambiarlos de lugar.
export const InicioPage = () => {
    const navigate = useNavigate();
    const { rol, UsuarioId } = useAuth();
    const clave = claveOrden(UsuarioId);

    const permitidos = useMemo(
        () => MODULOS.filter((m) => m.ruta !== '/inicio' && (!m.permiso || validarPermiso(rol, m.permiso))),
        [rol],
    );

    const [orden, setOrden] = useState<string[]>(() => leerOrden(clave));
    const [arrastrando, setArrastrando] = useState<string | null>(null);
    const [encima, setEncima] = useState<string | null>(null);
    const [desplazamiento, setDesplazamiento] = useState({ x: 0, y: 0 });   // cuánto se movió el botón que se arrastra

    // Arrastre con eventos de puntero (funciona con mouse y con el dedo en tablet/celular).
    // Hasta que el puntero se mueve unos píxeles es un clic normal; después es un arrastre y el clic se ignora.
    // Con el dedo solo se arrastra desde el asa (⋮⋮); desde el resto del botón el dedo hace scroll de la página.
    const inicio = useRef<{ ruta: string; x: number; y: number } | null>(null);
    const huboArrastre = useRef(false);
    const UMBRAL = 6;

    const alPresionar = (e: PointerEvent<HTMLButtonElement>, ruta: string) => {
        if (e.button !== 0) return;
        if (e.pointerType !== 'mouse' && !(e.target as HTMLElement).closest('[data-asa]')) return;
        inicio.current = { ruta, x: e.clientX, y: e.clientY };
        huboArrastre.current = false;
    };

    const alMover = (e: PointerEvent<HTMLButtonElement>) => {
        const i = inicio.current;
        if (!i) return;
        const dx = e.clientX - i.x;
        const dy = e.clientY - i.y;
        if (!huboArrastre.current) {
            if (Math.hypot(dx, dy) < UMBRAL) return;
            huboArrastre.current = true;
            setArrastrando(i.ruta);
            e.currentTarget.setPointerCapture(e.pointerId);   // seguir recibiendo el movimiento aunque el puntero salga del botón
        }
        setDesplazamiento({ x: dx, y: dy });
        // qué botón está debajo del puntero (el que se arrastra no cuenta: tiene pointer-events-none mientras se mueve)
        const debajo = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-ruta]');
        setEncima(debajo?.dataset.ruta ?? null);
    };

    const alSoltar = () => {
        const i = inicio.current;
        if (i && huboArrastre.current && encima) mover(i.ruta, encima);
        inicio.current = null;
        setArrastrando(null);
        setEncima(null);
        setDesplazamiento({ x: 0, y: 0 });
    };

    const botones = ordenar(permitidos, orden);

    // Suelta "ruta" en el lugar de "destino": se saca de su posición y se inserta donde estaba el otro
    const mover = (ruta: string, destino: string) => {
        if (ruta === destino) return;
        const rutas = botones.map((b) => b.ruta);
        const desde = rutas.indexOf(ruta);
        const hasta = rutas.indexOf(destino);
        rutas.splice(desde, 1);
        rutas.splice(hasta, 0, ruta);
        setOrden(rutas);
        guardarOrden(clave, rutas);
    };

    const restablecer = () => {
        setOrden([]);
        guardarOrden(clave, null);
    };

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink">¿Qué quieres hacer hoy?</h1>
                    <p className="mt-1 text-sm text-label">Elige un módulo. Puedes arrastrar los botones para ordenarlos a tu gusto.</p>
                </div>
                {orden.length > 0 && (
                    <button
                        type="button"
                        onClick={restablecer}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-label transition-colors hover:bg-hover"
                    >
                        <RotateCcw size={15} /> Restablecer orden
                    </button>
                )}
            </div>

            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {botones.map((m) => {
                    const ap = APARIENCIA[m.ruta] ?? { icono: LayoutDashboard, color: 'bg-hover text-label', descripcion: '' };
                    const Icono = ap.icono;
                    const esArrastrado = arrastrando === m.ruta;
                    const esDestino = encima === m.ruta && !esArrastrado;
                    return (
                        <li
                            key={m.ruta}
                            data-ruta={m.ruta}
                            className={`rounded-3xl transition-shadow ${esDestino ? 'ring-2 ring-info ring-offset-2 ring-offset-page' : ''}`}
                        >
                            <button
                                type="button"
                                onPointerDown={(e) => alPresionar(e, m.ruta)}
                                onPointerMove={alMover}
                                onPointerUp={alSoltar}
                                onPointerCancel={alSoltar}
                                onClick={() => { if (!huboArrastre.current) navigate(m.ruta); }}
                                style={esArrastrado ? { transform: `translate(${desplazamiento.x}px, ${desplazamiento.y}px) scale(1.03)` } : undefined}
                                className={`group relative flex h-36 w-full select-none items-center gap-5 rounded-3xl border border-line-soft bg-surface px-7 text-left shadow-card ${
                                    esArrastrado
                                        ? 'pointer-events-none relative z-20 cursor-grabbing shadow-menu'
                                        : 'cursor-pointer transition-all hover:-translate-y-0.5 hover:border-line hover:shadow-menu active:translate-y-0'
                                }`}
                            >
                                <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${ap.color}`}>
                                    <Icono size={30} strokeWidth={1.75} />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-lg font-semibold leading-tight text-ink">{m.nombre}</span>
                                    {ap.descripcion && <span className="mt-1 block text-sm text-muted">{ap.descripcion}</span>}
                                </span>
                                {/* asa para arrastrar: con el mouse se arrastra desde todo el botón; con el dedo, desde aquí */}
                                <span data-asa className="absolute right-2 top-2 touch-none rounded-lg p-1.5 text-line-input transition-opacity md:opacity-0 md:group-hover:opacity-100" title="Arrastrar para mover">
                                    <GripVertical size={18} />
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
