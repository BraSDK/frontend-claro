import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    RefreshCw, Calendar, ClipboardCheck, Download, CheckCircle2, Database, Wallet, MinusCircle, ListChecks,
    Search, X, Image as ImageIcon, ImageOff, Megaphone, Eye,
} from 'lucide-react';
import { getConciliacion, marcarApelacion, exportarDiferencias } from '../services/conciliacion.service';
import { getTecnicos } from '../services/dashboard.service';
import { CategoriaConciliacion, type ConciliacionResponse, type FilaConciliacion } from '../types/conciliacion.types';
import type { TecnicoOpcion } from '../types/dashboard.types';
import { CATEGORIAS, CategoriaBadge } from '../components/Conciliacion/CategoriaBadge';
import { DetalleSotDrawer } from '../components/Conciliacion/DetalleSotDrawer';
import { EstadoPagoChip, ESTADOS_PAGO } from '../components/shared/EstadoPagoChip';
import type { EstadoPago } from '../types/Ordenes';
import { MenuDinamico } from '../components/shared/MenuDinamico';
import { BarPaginancion } from '../components/Paginacion/BarPaginacion';
import { formatoDiferencia, formatoFechaCorta, formatoFechaHora, formatoSoles, NOMBRES_MES } from '../utils/formato';

const TAMANO_PAGINA = 10;

const claseSelect = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

// últimos 12 meses para el selector de periodo
const periodos = (() => {
    const hoy = new Date();
    return Array.from({ length: 12 }, (_, i) => {
        const f = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        return { anio: f.getFullYear(), mes: f.getMonth() + 1, etiqueta: `${NOMBRES_MES[f.getMonth()]} ${f.getFullYear()}` };
    });
})();

const Kpi = ({ icono, fondo, titulo, valor, valorClase = 'text-slate-900', detalle }: {
    icono: React.ReactNode; fondo: string; titulo: string; valor: string; valorClase?: string; detalle?: string;
}) => (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${fondo}`}>{icono}</div>
        <div className="min-w-0">
            <p className="text-sm text-slate-500">{titulo}</p>
            <p className={`mt-0.5 text-2xl font-bold tracking-tight ${valorClase}`}>{valor}</p>
            {detalle && <p className="text-xs text-slate-400">{detalle}</p>}
        </div>
    </div>
);

export const ConciliacionPage = () => {
    const navigate = useNavigate();

    // ===== Periodo y filtros =====
    const [periodo, setPeriodo] = useState(0);   // índice en "periodos"
    const [categoria, setCategoria] = useState<CategoriaConciliacion | null>(null);
    const [textoBusqueda, setTextoBusqueda] = useState('');
    const [buscar, setBuscar] = useState('');
    const [tecnicoId, setTecnicoId] = useState('');
    const [conEvidencia, setConEvidencia] = useState('');
    const [categoriaServicio, setCategoriaServicio] = useState('');
    const [apelacion, setApelacion] = useState('');
    const [estadoPago, setEstadoPago] = useState('');
    const [pagina, setPagina] = useState(1);

    const [datos, setDatos] = useState<ConciliacionResponse | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tecnicos, setTecnicos] = useState<TecnicoOpcion[]>([]);
    const [seleccion, setSeleccion] = useState<Set<number>>(new Set());
    const [filaAbierta, setFilaAbierta] = useState<FilaConciliacion | null>(null);
    const [exportando, setExportando] = useState(false);
    const [recarga, setRecarga] = useState(0);   // sube para volver a pedir los datos

    const { anio, mes, etiqueta } = periodos[periodo];

    useEffect(() => { getTecnicos().then(setTecnicos).catch(() => setTecnicos([])); }, []);

    // búsqueda con retardo de 400 ms
    useEffect(() => {
        const t = setTimeout(() => { setBuscar(textoBusqueda.trim()); setPagina(1); }, 400);
        return () => clearTimeout(t);
    }, [textoBusqueda]);

    const params = useMemo(() => ({
        anio, mes, pagina, canPagina: TAMANO_PAGINA,
        categoria: categoria ?? undefined,
        buscar: buscar || undefined,
        tecnicoId: tecnicoId ? Number(tecnicoId) : undefined,
        conEvidencia: conEvidencia === '' ? undefined : conEvidencia === 'si',
        categoriaServicio: categoriaServicio === '' ? undefined : Number(categoriaServicio),
        apelacion: apelacion === '' ? undefined : apelacion === 'si',
        estadoPago: estadoPago === '' ? undefined : Number(estadoPago) as EstadoPago,
    }), [anio, mes, pagina, categoria, buscar, tecnicoId, conEvidencia, categoriaServicio, apelacion, estadoPago]);

    useEffect(() => {
        let activo = true;
        setCargando(true);
        getConciliacion(params)
            .then((d) => {
                if (!activo) return;
                setDatos(d);
                setError(null);
                // si el drawer está abierto, refresca su fila (p. ej. tras marcar apelación)
                setFilaAbierta((abierta) => abierta ? d.filas.find((f) => f.ordenId === abierta.ordenId) ?? abierta : null);
            })
            .catch((err) => activo && setError(err.response?.status === 403 ? 'No tienes permisos para ver la conciliación.' : 'No se pudo cargar la conciliación.'))
            .finally(() => activo && setCargando(false));
        return () => { activo = false; };
    }, [params, recarga]);

    // al cambiar un filtro se vuelve a la página 1 y se limpia la selección
    const filtro = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPagina(1); setSeleccion(new Set()); };

    const hayFiltros = !!(textoBusqueda || tecnicoId || conEvidencia || categoriaServicio || apelacion || estadoPago || categoria !== null);
    const limpiar = () => {
        setTextoBusqueda(''); setBuscar(''); setTecnicoId(''); setConEvidencia(''); setCategoriaServicio(''); setApelacion(''); setEstadoPago('');
        setCategoria(null); setPagina(1); setSeleccion(new Set());
    };

    const cambiarApelacion = async (ordenIds: number[], marcar: boolean) => {
        await marcarApelacion(ordenIds, marcar);
        setSeleccion(new Set());
        setRecarga((n) => n + 1);
    };

    const exportar = async () => {
        try { setExportando(true); await exportarDiferencias(anio, mes); }
        catch { setError('No se pudo exportar el Excel de diferencias.'); }
        finally { setExportando(false); }
    };

    const filas = datos?.filas ?? [];
    const todasMarcadas = filas.length > 0 && filas.every((f) => seleccion.has(f.ordenId));
    const alternarTodas = () => setSeleccion(todasMarcadas ? new Set() : new Set(filas.map((f) => f.ordenId)));
    const alternar = (id: number) => setSeleccion((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

    const total = datos ? datos.cuadra + datos.diferencia + datos.noPagada + datos.porAuditar : 0;
    const pastillas: { valor: CategoriaConciliacion | null; label: string; cantidad: number }[] = [
        { valor: null, label: 'Todas', cantidad: total },
        { valor: CategoriaConciliacion.CUADRA, label: 'Cuadra', cantidad: datos?.cuadra ?? 0 },
        { valor: CategoriaConciliacion.DIFERENCIA, label: 'Diferencia', cantidad: datos?.diferencia ?? 0 },
        { valor: CategoriaConciliacion.NO_PAGADA, label: 'No pagada', cantidad: datos?.noPagada ?? 0 },
        { valor: CategoriaConciliacion.POR_AUDITAR, label: 'Por auditar', cantidad: datos?.porAuditar ?? 0 },
    ];

    return (
        <div className={`flex flex-col gap-5 ${filaAbierta ? 'xl:pr-[380px]' : ''} transition-[padding]`}>
            {/* Título */}
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <RefreshCw size={22} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Conciliación de pagos</h1>
                    <p className="mt-0.5 text-sm text-slate-500">Compara la valorización de almacén con lo que se paga tras la auditoría de cada SOT.</p>
                </div>
            </div>

            {/* Controles del periodo */}
            <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200/70 bg-white px-5 py-4">
                <label className="flex flex-col gap-1 text-xs text-slate-500">
                    Periodo
                    <div className="relative">
                        <Calendar size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            value={periodo}
                            onChange={(e) => filtro(setPeriodo)(Number(e.target.value))}
                            className={`${claseSelect} w-56 pl-9 font-medium`}
                        >
                            {periodos.map((p, i) => <option key={i} value={i}>{p.etiqueta}</option>)}
                        </select>
                    </div>
                </label>

                <button
                    type="button"
                    onClick={() => filtro(setCategoria)(CategoriaConciliacion.POR_AUDITAR)}
                    className="flex h-10 items-center gap-2 rounded-lg bg-blue-50 px-4 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                >
                    <ClipboardCheck size={16} /> Ver pendientes de auditar ({datos?.porAuditar ?? 0})
                </button>

                <div className="ml-auto flex flex-wrap items-center justify-end gap-x-5 gap-y-3">
                    <div className="flex items-center gap-3 border-slate-100 pr-1 lg:border-r lg:pr-5">
                        <CheckCircle2 size={22} className={datos?.ultimaAuditoria ? 'text-green-500' : 'text-slate-300'} />
                        <div className="text-xs">
                            <p className="text-slate-500">Última auditoría</p>
                            <p className="font-medium text-slate-700">{datos?.ultimaAuditoria ? formatoFechaHora(datos.ultimaAuditoria) : 'Sin auditorías en el periodo'}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={exportar}
                        disabled={exportando || !datos}
                        title="Excel con las SOT en Diferencia, No pagada y Por auditar"
                        className="flex h-10 items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 disabled:opacity-60"
                    >
                        <Download size={16} /> {exportando ? 'Exportando...' : 'Exportar diferencias'}
                    </button>
                </div>
            </div>

            {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi icono={<Database size={22} className="text-blue-600" />} fondo="bg-blue-50" titulo="Total valorizado (Almacén)" valor={formatoSoles(datos?.totalValorizado)} />
                <Kpi icono={<Wallet size={22} className="text-green-600" />} fondo="bg-green-50" titulo="Total a pagar (auditado)" valor={formatoSoles(datos?.totalPagado)} />
                <Kpi
                    icono={<MinusCircle size={22} className="text-rose-500" />} fondo="bg-rose-50" titulo="Diferencia total"
                    valor={formatoDiferencia(datos?.diferenciaTotal ?? 0)}
                    valorClase={(datos?.diferenciaTotal ?? 0) < 0 ? 'text-rose-600' : 'text-slate-900'}
                    detalle="Descuentos y multas de la auditoría"
                />
                <Kpi
                    icono={<ListChecks size={22} className="text-violet-600" />} fondo="bg-violet-50" titulo="SOT evaluadas"
                    valor={`${datos?.sotEvaluadas ?? 0}`}
                    detalle={datos ? `de ${datos.totalSots} SOT del periodo` : undefined}
                />
            </div>

            {/* Totales en soles por estado de pago (click = filtrar) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(datos?.totalesPorEstadoPago ?? []).map((t) => {
                    const activo = estadoPago === String(t.estadoPago);
                    return (
                        <button
                            key={t.estadoPago}
                            type="button"
                            onClick={() => filtro(setEstadoPago)(activo ? '' : String(t.estadoPago))}
                            className={`flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-left transition-colors ${activo ? 'border-blue-400 ring-2 ring-blue-500/15' : 'border-slate-200/70 hover:bg-slate-50'}`}
                            title={`Filtrar por ${ESTADOS_PAGO[t.estadoPago].label}`}
                        >
                            <div className="flex flex-col items-start gap-1">
                                <EstadoPagoChip estado={t.estadoPago} />
                                <span className="text-xs text-slate-400">{t.cantidad} SOT</span>
                            </div>
                            <span className="text-lg font-bold text-slate-900">{formatoSoles(t.monto)}</span>
                        </button>
                    );
                })}
            </div>

            {/* Filtros */}
            <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-white px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                    {pastillas.map((p) => {
                        const activa = categoria === p.valor;
                        const info = p.valor === null ? null : CATEGORIAS[p.valor];
                        return (
                            <button
                                key={p.label}
                                type="button"
                                onClick={() => filtro(setCategoria)(p.valor)}
                                className={`flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
                                    activa ? 'bg-blue-600 text-white shadow-sm' : info ? `${info.pill} hover:brightness-95` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {info && <span className={`h-2 w-2 rounded-full ${activa ? 'bg-white' : info.punto}`} />}
                                {p.label} ({p.cantidad})
                            </button>
                        );
                    })}

                    <div className="relative ml-auto w-full sm:w-72">
                        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            inputMode="numeric"
                            value={textoBusqueda}
                            onChange={(e) => setTextoBusqueda(e.target.value)}
                            placeholder="Buscar por SOT..."
                            className={`${claseSelect} pl-9`}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,200px))_auto] lg:items-end">
                    <label className="flex flex-col gap-1 text-xs text-slate-500">
                        Técnico
                        <select value={tecnicoId} onChange={(e) => filtro(setTecnicoId)(e.target.value)} className={claseSelect}>
                            <option value="">Todos</option>
                            {tecnicos.map((t) => <option key={t.usuarioId} value={t.usuarioId}>{t.nombre}</option>)}
                        </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-slate-500">
                        Con evidencia
                        <select value={conEvidencia} onChange={(e) => filtro(setConEvidencia)(e.target.value)} className={claseSelect}>
                            <option value="">Todos</option>
                            <option value="si">Con evidencia</option>
                            <option value="no">Sin evidencia</option>
                        </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-slate-500">
                        Tipo de servicio
                        <select value={categoriaServicio} onChange={(e) => filtro(setCategoriaServicio)(e.target.value)} className={claseSelect}>
                            <option value="">Todos</option>
                            <option value="0">HFC</option>
                            <option value="1">FTTH</option>
                            <option value="2">Mantenimiento</option>
                        </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-slate-500">
                        Apelación
                        <select value={apelacion} onChange={(e) => filtro(setApelacion)(e.target.value)} className={claseSelect}>
                            <option value="">Todos</option>
                            <option value="si">Marcadas para apelación</option>
                            <option value="no">No marcadas</option>
                        </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-slate-500">
                        Estado de pago
                        <select value={estadoPago} onChange={(e) => filtro(setEstadoPago)(e.target.value)} className={claseSelect}>
                            <option value="">Todos</option>
                            {Object.entries(ESTADOS_PAGO).map(([valor, info]) => <option key={valor} value={valor}>{info.label}</option>)}
                        </select>
                    </label>
                    {hayFiltros && (
                        <button type="button" onClick={limpiar} className="flex h-10 items-center gap-1.5 justify-self-start rounded-lg px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
                            <X size={15} /> Limpiar filtros
                        </button>
                    )}
                </div>
            </div>

            {/* Tabla */}
            <div className="rounded-2xl border border-slate-200/70 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Detalle de conciliación</h2>
                        <p className="text-sm text-slate-500">Cada SOT del periodo: valorización de almacén frente a lo que se paga.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {seleccion.size > 0 && (
                            <>
                                <span className="text-sm text-slate-500">{seleccion.size} seleccionadas</span>
                                <button
                                    type="button"
                                    onClick={() => cambiarApelacion([...seleccion], true)}
                                    className="flex h-9 items-center gap-2 rounded-lg bg-orange-50 px-3 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100"
                                >
                                    <Megaphone size={15} /> Marcar para apelación
                                </button>
                            </>
                        )}
                        <span className="text-sm text-slate-400">{datos?.totalFilas ?? 0} resultados</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-y border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="w-10 px-5 py-3"><input type="checkbox" checked={todasMarcadas} onChange={alternarTodas} className="h-4 w-4 accent-blue-600" aria-label="Seleccionar todas" /></th>
                                <th className="px-3 py-3 text-left">SOT</th>
                                <th className="px-3 py-3 text-left">Fecha</th>
                                <th className="px-3 py-3 text-left">Técnico</th>
                                <th className="px-3 py-3 text-left">Tipo de servicio</th>
                                <th className="px-3 py-3 text-right">P. Total<br />almacén</th>
                                <th className="px-3 py-3 text-right">Pagado<br />Claro</th>
                                <th className="px-3 py-3 text-right">Diferencia</th>
                                <th className="px-3 py-3 text-left">Categoría</th>
                                <th className="px-3 py-3 text-left">Pago</th>
                                <th className="px-3 py-3 text-center">Evidencia</th>
                                <th className="px-5 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y divide-slate-100 transition-opacity ${cargando ? 'opacity-50' : ''}`}>
                            {filas.length === 0 ? (
                                <tr>
                                    <td colSpan={12} className="px-5 py-14 text-center text-sm text-slate-400">
                                        {cargando ? 'Cargando...' : `No hay SOT para mostrar en ${etiqueta}${hayFiltros ? ' con estos filtros' : ''}.`}
                                    </td>
                                </tr>
                            ) : filas.map((f) => (
                                <tr
                                    key={f.ordenId}
                                    onClick={() => setFilaAbierta(f)}
                                    className={`cursor-pointer transition-colors ${filaAbierta?.ordenId === f.ordenId ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'}`}
                                >
                                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                                        <input type="checkbox" checked={seleccion.has(f.ordenId)} onChange={() => alternar(f.ordenId)} className="h-4 w-4 accent-blue-600" aria-label={`Seleccionar SOT ${f.sot}`} />
                                    </td>
                                    <td className="px-3 py-3.5">
                                        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                                            {f.sot}
                                            {f.marcadaApelacion && <span title="Marcada para apelación"><Megaphone size={13} className="text-orange-500" /></span>}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3.5 text-slate-600">{formatoFechaCorta(f.fecha)}</td>
                                    <td className="max-w-[180px] truncate px-3 py-3.5 font-medium text-slate-700" title={f.tecnico}>{f.tecnico || '-'}</td>
                                    <td className="max-w-[200px] truncate px-3 py-3.5 text-slate-500" title={f.tipoServicio}>{f.tipoServicio || '-'}</td>
                                    <td className="whitespace-nowrap px-3 py-3.5 text-right text-slate-700">{formatoSoles(f.valorizado)}</td>
                                    <td className="whitespace-nowrap px-3 py-3.5 text-right text-slate-700">{f.pagado === null ? <span className="text-slate-300">—</span> : formatoSoles(f.pagado)}</td>
                                    <td className={`whitespace-nowrap px-3 py-3.5 text-right font-medium ${
                                        f.diferencia === null ? 'text-slate-300' : f.diferencia < 0 ? 'text-rose-600' : f.diferencia > 0 ? 'text-orange-600' : 'text-slate-400'
                                    }`}>
                                        {formatoDiferencia(f.diferencia)}
                                    </td>
                                    <td className="px-3 py-3.5"><CategoriaBadge categoria={f.categoria} /></td>
                                    <td className="px-3 py-3.5"><EstadoPagoChip estado={f.estadoPago} motivo={f.motivoNoPago} /></td>
                                    <td className="px-3 py-3.5 text-center">
                                        {f.cantidadImagenes > 0 ? (
                                            <span title={`${f.cantidadImagenes} imágenes`} className="inline-flex text-blue-500"><ImageIcon size={17} /></span>
                                        ) : (
                                            <span className="inline-flex flex-col items-center text-slate-300" title="Sin evidencia">
                                                <ImageOff size={17} />
                                                <span className="text-[10px] text-slate-400">Sin evidencia</span>
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                                        <MenuDinamico
                                            opciones={[
                                                { label: 'Ver detalle', icono: <Eye size={16} />, accion: () => setFilaAbierta(f) },
                                                { label: f.categoria === CategoriaConciliacion.POR_AUDITAR ? 'Auditar SOT' : 'Revisar auditoría', icono: <ClipboardCheck size={16} />, accion: () => navigate(`/ordenes/${f.ordenId}/auditar`) },
                                                {
                                                    label: f.marcadaApelacion ? 'Quitar de apelación' : 'Marcar para apelación',
                                                    icono: <Megaphone size={16} />,
                                                    accion: () => cambiarApelacion([f.ordenId], !f.marcadaApelacion),
                                                },
                                            ]}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <BarPaginancion
                    onHandle={setPagina}
                    numeroPagina={datos?.pagina ?? pagina}
                    totalRegistros={datos?.totalFilas ?? 0}
                    totalRegistrosPagina={filas.length}
                    totalPaginasTotales={datos?.totalPaginas ?? 1}
                    acento="blue"
                />
            </div>

            {filaAbierta && (
                <DetalleSotDrawer
                    fila={filaAbierta}
                    onClose={() => setFilaAbierta(null)}
                    onApelacion={(id, marcar) => cambiarApelacion([id], marcar)}
                />
            )}
        </div>
    );
};
