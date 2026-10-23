import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, ChevronLeft, ChevronRight, ClipboardList, Wallet, Receipt, CheckCircle2,
    Users, Wrench, Layers, Clock, ArrowRight, ImageOff,
} from 'lucide-react';
import { StatCard } from '../components/Cards/StatsCard';
import { Card } from '../components/Cards/Card';
import { EstadoBadge, ESTADOS_ORDEN } from '../components/shared/EstadoBadge';
import { useAuth } from '../hooks/useAuth';
import { getResumenDashboard } from '../services/dashboard.service';
import type { DashboardResumen } from '../types/dashboard.types';
import { formatoFecha, formatoSoles, iniciales, NOMBRES_MES, variacion } from '../utils/formato';

// nombre y color de cada tipo de detalle (coincide con el enum TipoDetalle del back)
const TIPOS_DETALLE: Record<number, { label: string; color: string }> = {
    0: { label: 'Servicio principal', color: 'bg-primary' },
    1: { label: 'Adicional (decos / repetidores)', color: 'bg-primary-light' },
    2: { label: 'Drop 150', color: 'bg-primary/55' },
    3: { label: 'Drop 220', color: 'bg-primary-light/45' },
    4: { label: 'Drop 300', color: 'bg-line-fixed' },
};

// barra horizontal simple: porcentaje respecto al mayor valor de la lista
const Barra = ({ porcentaje, color = 'bg-primary' }: { porcentaje: number; color?: string }) => (
    <div className="h-2 w-full overflow-hidden rounded-pill bg-page">
        <div className={`h-full rounded-pill ${color} transition-all duration-500`} style={{ width: `${Math.max(porcentaje, 2)}%` }} />
    </div>
);

const SinDatos = ({ texto = 'Sin datos en este mes' }: { texto?: string }) => (
    <p className="py-8 text-center text-sm text-muted">{texto}</p>
);

export const DashboardPage = () => {
    const navigate = useNavigate();
    const { esTecnico } = useAuth();
    const hoy = new Date();
    const [anio, setAnio] = useState(hoy.getFullYear());
    const [mes, setMes] = useState(hoy.getMonth() + 1);
    const [resumen, setResumen] = useState<DashboardResumen | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let activo = true;
        setCargando(true);
        setError(null);
        getResumenDashboard(anio, mes)
            .then((data) => activo && setResumen(data))
            .catch(() => activo && setError('No se pudo cargar el resumen'))
            .finally(() => activo && setCargando(false));
        return () => { activo = false; };
    }, [anio, mes]);

    const moverMes = (delta: number) => {
        const fecha = new Date(anio, mes - 1 + delta, 1);
        setAnio(fecha.getFullYear());
        setMes(fecha.getMonth() + 1);
    };
    const esMesActual = anio === hoy.getFullYear() && mes === hoy.getMonth() + 1;

    const tendencia = (actual: number, anterior: number) => {
        const v = variacion(actual, anterior);
        return v === null ? undefined : { value: `${Math.abs(v).toFixed(0)}%`, direction: v >= 0 ? 'up' as const : 'down' as const, label: 'vs. mes anterior' };
    };

    const r = resumen;
    const liquidadas = r?.porEstado.find((e) => e.estado === 2)?.cantidad ?? 0;
    const maxTecnico = Math.max(1, ...(r?.porTecnico.map((t) => (esTecnico ? t.cantidad : t.monto)) ?? [0]));
    const maxServicio = Math.max(1, ...(r?.porServicio.map((s) => s.cantidad) ?? [0]));
    const totalTipos = r?.porTipoDetalle.reduce((acc, t) => acc + t.monto, 0) ?? 0;

    return (
        <div className={`flex flex-col gap-6 transition-opacity ${cargando ? 'opacity-60' : ''}`}>
            {/* Cabecera con selector de mes */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-primary-soft text-primary">
                        <LayoutDashboard size={26} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
                        <p className="mt-1 text-sm text-label">
                            {esTecnico ? 'Resumen de tus SOTs del mes.' : 'Producción del mes por técnico y tipo de servicio.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 rounded-mid border border-line bg-surface p-1 ">
                    <button type="button" onClick={() => moverMes(-1)} className="rounded-control p-2 text-label transition-colors hover:bg-page" title="Mes anterior">
                        <ChevronLeft size={18} />
                    </button>
                    <span className="min-w-36 text-center text-sm font-semibold text-ink">
                        {NOMBRES_MES[mes - 1]} {anio}
                    </span>
                    <button
                        type="button"
                        onClick={() => moverMes(1)}
                        disabled={esMesActual}
                        className="rounded-control p-2 text-label transition-colors hover:bg-page disabled:cursor-not-allowed disabled:opacity-30"
                        title="Mes siguiente"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {error && <p className="rounded-control border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm text-danger">{error}</p>}

            {/* Totales del mes */}
            <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${esTecnico ? 'lg:grid-cols-2' : 'lg:grid-cols-4'}`}>
                <StatCard
                    title="SOTs del mes"
                    icon={ClipboardList}
                    value={r?.totalSots ?? '-'}
                    trend={r ? tendencia(r.totalSots, r.totalSotsMesAnterior) : undefined}
                    iconClassName="bg-primary-soft text-primary"
                />
                {!esTecnico && (
                    <>
                        <StatCard
                            title="Monto total"
                            icon={Wallet}
                            value={r ? formatoSoles(r.montoTotal) : '-'}
                            trend={r ? tendencia(r.montoTotal, r.montoTotalMesAnterior) : undefined}
                            iconClassName="bg-success-soft text-success"
                        />
                        <StatCard
                            title="Claro paga (tras auditoría)"
                            icon={Receipt}
                            value={r ? formatoSoles(r.montoAPagar) : '-'}
                            trend={r && r.montoTotal > r.montoAPagar
                                ? { value: formatoSoles(r.montoTotal - r.montoAPagar), direction: 'down', label: 'en descuentos y multas' }
                                : undefined}
                            iconClassName="bg-primary-soft text-primary"
                        />
                    </>
                )}
                <StatCard
                    title={esTecnico ? 'Liquidadas' : 'Auditadas'}
                    icon={CheckCircle2}
                    value={r ? `${esTecnico ? liquidadas : r.sotsAuditadas} / ${r.totalSots}` : '-'}
                    iconClassName="bg-warning-soft text-warning"
                />
            </div>

            {/* SOTs que no se pueden validar todavía */}
            {!esTecnico && r && r.sotsSinImagen > 0 && (
                <button
                    type="button"
                    onClick={() => navigate('/ordenes')}
                    className="flex items-center justify-between gap-3 rounded-mid border border-warning/30 bg-warning-soft px-5 py-3 text-left text-sm text-warning transition-colors hover:bg-warning-soft"
                >
                    <span className="flex items-center gap-2">
                        <ImageOff size={18} />
                        <strong>{r.sotsSinImagen}</strong> {r.sotsSinImagen === 1 ? 'SOT de este mes no tiene' : 'SOTs de este mes no tienen'} imagen del técnico para validar.
                    </span>
                    <ArrowRight size={16} />
                </button>
            )}

            {/* Por estado: barra apilada */}
            <Card title="SOTs por estado" subtitle="Cómo avanza el trabajo del mes">
                {!r || r.totalSots === 0 ? <SinDatos /> : (
                    <>
                        <div className="flex h-3 w-full overflow-hidden rounded-pill bg-page">
                            {r.porEstado.map((e) => (
                                <div
                                    key={e.estado}
                                    className={ESTADOS_ORDEN[e.estado]?.barra ?? 'bg-ink'}
                                    style={{ width: `${(e.cantidad / r.totalSots) * 100}%` }}
                                    title={`${ESTADOS_ORDEN[e.estado]?.label}: ${e.cantidad}`}
                                />
                            ))}
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {Object.entries(ESTADOS_ORDEN).map(([valor, info]) => {
                                const dato = r.porEstado.find((e) => e.estado === Number(valor));
                                return (
                                    <div key={valor} className="flex items-center justify-between rounded-control border border-line bg-page/60 px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`h-2.5 w-2.5 rounded-pill ${info.barra}`} />
                                            <span className="text-sm font-medium text-label">{info.label}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-ink">{dato?.cantidad ?? 0}</p>
                                            {!esTecnico && <p className="text-xs text-muted">{formatoSoles(dato?.monto)}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </Card>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Por técnico */}
                {!esTecnico && (
                    <Card
                        title="Producción por técnico"
                        subtitle="Ordenado por monto"
                        icon={<div className="flex h-10 w-10 items-center justify-center rounded-pill bg-primary-soft text-primary"><Users size={20} strokeWidth={1.75} /></div>}
                    >
                        {!r || r.porTecnico.length === 0 ? <SinDatos /> : (
                            <ul className="space-y-4">
                                {r.porTecnico.map((t, i) => (
                                    <li key={t.usuarioId} className="flex items-center gap-3">
                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-xs font-bold ${i === 0 ? 'bg-brand text-on-primary' : 'bg-page text-label'}`}>
                                            {iniciales(t.nombre)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1.5 flex items-baseline justify-between gap-2">
                                                <p className="truncate text-sm font-medium text-ink" title={t.nombre}>{t.nombre}</p>
                                                <p className="shrink-0 text-sm font-semibold text-ink">{formatoSoles(t.monto)}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Barra porcentaje={(t.monto / maxTecnico) * 100} color={i === 0 ? 'bg-primary' : 'bg-primary-light/50'} />
                                                <span className="shrink-0 text-xs text-muted">{t.cantidad} SOTs</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                )}

                {/* Por tipo de servicio */}
                <Card
                    title="Servicios más realizados"
                    subtitle="Servicio principal de cada SOT"
                    icon={<div className="flex h-10 w-10 items-center justify-center rounded-pill bg-primary-soft text-primary"><Wrench size={20} /></div>}
                >
                    {!r || r.porServicio.length === 0 ? <SinDatos /> : (
                        <ul className="space-y-3.5">
                            {r.porServicio.map((s) => (
                                <li key={s.nombre}>
                                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                                        <p className="truncate text-sm text-ink" title={s.nombre}>{s.nombre}</p>
                                        <p className="shrink-0 text-sm font-semibold text-ink">
                                            {s.cantidad}
                                            {!esTecnico && <span className="ml-2 text-xs font-normal text-muted">{formatoSoles(s.monto)}</span>}
                                        </p>
                                    </div>
                                    <Barra porcentaje={(s.cantidad / maxServicio) * 100} color="bg-primary" />
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                {/* Composición: servicio vs adicionales vs drops */}
                {!esTecnico && (
                    <Card
                        title="Composición del monto"
                        subtitle="Servicio principal, adicionales y drops"
                        icon={<div className="flex h-10 w-10 items-center justify-center rounded-pill bg-primary-soft text-primary"><Layers size={20} /></div>}
                    >
                        {!r || totalTipos === 0 ? <SinDatos /> : (
                            <>
                                <div className="flex h-3 w-full overflow-hidden rounded-pill bg-page">
                                    {r.porTipoDetalle.map((t) => (
                                        <div
                                            key={t.tipo}
                                            className={TIPOS_DETALLE[t.tipo]?.color ?? 'bg-ink'}
                                            style={{ width: `${(t.monto / totalTipos) * 100}%` }}
                                        />
                                    ))}
                                </div>
                                <ul className="mt-4 divide-y divide-line">
                                    {r.porTipoDetalle.map((t) => (
                                        <li key={t.tipo} className="flex items-center justify-between py-2.5 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2.5 w-2.5 rounded-pill ${TIPOS_DETALLE[t.tipo]?.color ?? 'bg-ink'}`} />
                                                <span className="text-ink">{TIPOS_DETALLE[t.tipo]?.label ?? `Tipo ${t.tipo}`}</span>
                                                <span className="text-xs text-muted">× {t.cantidad}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-semibold text-ink">{formatoSoles(t.monto)}</span>
                                                <span className="ml-2 text-xs text-muted">{((t.monto / totalTipos) * 100).toFixed(0)}%</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </Card>
                )}

                {/* Últimas SOTs */}
                <Card
                    title="Últimas SOTs"
                    subtitle="Las más recientes registradas"
                    icon={<div className="flex h-10 w-10 items-center justify-center rounded-control bg-page text-label"><Clock size={20} /></div>}
                    actions={
                        <button
                            type="button"
                            onClick={() => navigate('/ordenes')}
                            className="flex items-center gap-1 rounded-pill px-2 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary-soft"
                        >
                            Ver todas <ArrowRight size={16} />
                        </button>
                    }
                >
                    {!r || r.ultimasSots.length === 0 ? <SinDatos texto="Aún no hay SOTs registradas" /> : (
                        <ul className="divide-y divide-line">
                            {r.ultimasSots.map((o) => (
                                <li key={o.ordenId}>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/ordenes/${o.sot}/editar`)}
                                        className="flex w-full items-center justify-between gap-3 rounded-control px-2 py-3 text-left transition-colors hover:bg-page"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-ink">SOT {o.sot}</p>
                                            <p className="truncate text-xs text-muted">
                                                {formatoFecha(o.fecha)}{!esTecnico && ` · ${o.nombreUsuario}`}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-3">
                                            {!esTecnico && <span className="text-sm font-medium text-ink">{formatoSoles(o.precioTotal)}</span>}
                                            <EstadoBadge estado={o.estado} />
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </div>
    );
};
