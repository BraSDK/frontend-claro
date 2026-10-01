import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WorkflowIcon, FileSpreadsheet, Search, X, ClipboardList, Wallet, Clock, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { useOrdenTrabajo } from '../../hooks/ordenes/useOrden';
import { OrdenesTable } from '../../components/Ordenes/OrdenesList';
import { StatCard } from '../../components/Cards/StatsCard';
import { BarPaginancion } from '../../components/Paginacion/BarPaginacion';
import { ImportarExcelModal } from '../../components/Ordenes/ImportarExcelModal';
import { ESTADOS_ORDEN } from '../../components/shared/EstadoBadge';
import { useAuth } from '../../hooks/useAuth';
import { getResumenDashboard, getTecnicos } from '../../services/dashboard.service';
import type { DashboardResumen, TecnicoOpcion } from '../../types/dashboard.types';
import type { EstadoOrden, OrdenesTrabajoRequest } from '../../types/Ordenes';
import { formatoSoles, NOMBRES_MES, variacion } from '../../utils/formato';
import { auditarMasivo } from '../../services/Ordenes/OrdenesTrabajo.service';

const TAMANO_PAGINA = 15;

const claseInput = "h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition-all hover:border-gray-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/10";

export const OrdenesPage = () => {
    const navigate = useNavigate();
    const { esTecnico } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    // ===== Filtros =====
    const [pagina, setPagina] = useState(1);
    const [textoBusqueda, setTextoBusqueda] = useState(searchParams.get('buscar') ?? '');
    const [buscar, setBuscar] = useState(searchParams.get('buscar') ?? '');   // con retardo, para no pedir en cada tecla
    const [estado, setEstado] = useState<EstadoOrden | ''>('');
    const [tecnicoId, setTecnicoId] = useState<number | ''>('');
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const [auditada, setAuditada] = useState<'' | 'si' | 'no'>('');

    // ===== Auditoría masiva =====
    const [seleccion, setSeleccion] = useState<Set<number>>(new Set());
    const [auditando, setAuditando] = useState(false);
    const [mensajeAuditoria, setMensajeAuditoria] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

    const [importarAbierto, setImportarAbierto] = useState(false);
    const [tecnicos, setTecnicos] = useState<TecnicoOpcion[]>([]);
    const [resumen, setResumen] = useState<DashboardResumen | null>(null);

    // la búsqueda del header llega como ?buscar=...
    useEffect(() => {
        const desdeUrl = searchParams.get('buscar') ?? '';
        setTextoBusqueda(desdeUrl);
        setBuscar(desdeUrl);
        setPagina(1);
    }, [searchParams]);

    // espera 400 ms después de la última tecla antes de buscar
    useEffect(() => {
        const t = setTimeout(() => { setBuscar(textoBusqueda.trim()); setPagina(1); }, 400);
        return () => clearTimeout(t);
    }, [textoBusqueda]);

    const params = useMemo<OrdenesTrabajoRequest>(() => ({
        pagina,
        canPagina: TAMANO_PAGINA,
        buscar: buscar || undefined,
        estado: estado === '' ? undefined : estado,
        tecnicoId: tecnicoId === '' ? undefined : tecnicoId,
        auditada: auditada === '' ? undefined : auditada === 'si',
        desde: desde || undefined,
        hasta: hasta || undefined,
    }), [pagina, buscar, estado, tecnicoId, auditada, desde, hasta]);

    // al cambiar de página o de filtros se limpia la selección
    useEffect(() => { setSeleccion(new Set()); }, [params]);

    // el hook vuelve a pedir el listado solo cuando cambian los params
    const { OrdenesT, page, isLoading, refetch, EliminarOrden } = useOrdenTrabajo(params);

    const cargarResumen = () => getResumenDashboard().then(setResumen).catch(() => setResumen(null));

    useEffect(() => {
        cargarResumen();
        if (!esTecnico) getTecnicos().then(setTecnicos).catch(() => setTecnicos([]));
    }, [esTecnico]);

    const cambiarFiltro = <T,>(setter: (v: T) => void) => (valor: T) => { setter(valor); setPagina(1); };

    const hayFiltros = !!(textoBusqueda || estado !== '' || tecnicoId !== '' || auditada || desde || hasta);
    const limpiarFiltros = () => {
        setTextoBusqueda(''); setBuscar(''); setEstado(''); setTecnicoId(''); setAuditada(''); setDesde(''); setHasta(''); setPagina(1);
        if (searchParams.get('buscar')) setSearchParams({});
    };

    const handleDelete = async (id: number) => {
        await EliminarOrden(id);
        refetch();
        cargarResumen();
    };

    const alImportar = () => { refetch(); cargarResumen(); };

    const alternarSeleccion = (id: number) =>
        setSeleccion((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

    // Audita sin descuento: las seleccionadas, o (sin selección) todas las pendientes que cumplen los filtros.
    // Primero pide el conteo al back para mostrar una confirmación con números reales.
    const auditarSinDescuento = async (ordenIds?: number[]) => {
        const { pagina: _p, canPagina: _c, ...filtros } = params;
        const pedido = ordenIds ? { ordenIds } : { filtros };
        try {
            setAuditando(true);
            setMensajeAuditoria(null);
            const previa = await auditarMasivo({ ...pedido, confirmar: false });
            if (previa.auditadas === 0) {
                setMensajeAuditoria({ tipo: 'ok', texto: 'No hay SOT pendientes de auditar con esta selección.' });
                return;
            }
            const avisos = [
                `Se auditarán ${previa.auditadas} SOT sin descuento ni multa (quedarán LIQUIDADAS y en "Cuadra").`,
                previa.sinImagen > 0 ? `⚠ ${previa.sinImagen} de ellas no tienen imagen del técnico.` : '',
                previa.yaAuditadas > 0 ? `${previa.yaAuditadas} ya estaban auditadas y se omitirán.` : '',
                ordenIds ? '' : 'Se incluyen todas las páginas que cumplen los filtros actuales.',
                '\n¿Continuar?',
            ].filter(Boolean).join('\n');
            if (!window.confirm(avisos)) return;

            const resultado = await auditarMasivo({ ...pedido, confirmar: true });
            setMensajeAuditoria({ tipo: 'ok', texto: `${resultado.auditadas} SOT auditadas sin descuento.` });
            setSeleccion(new Set());
            refetch();
            cargarResumen();
        } catch (err: any) {
            setMensajeAuditoria({ tipo: 'error', texto: err.response?.status === 403 ? 'No tienes permisos para auditar.' : 'No se pudo completar la auditoría masiva.' });
        } finally {
            setAuditando(false);
        }
    };

    // ===== Tarjetas =====
    const cantidadEstado = (e: number) => resumen?.porEstado.find((x) => x.estado === e)?.cantidad ?? 0;
    const tendencia = (actual: number, anterior: number) => {
        const v = variacion(actual, anterior);
        return v === null ? undefined : { value: `${Math.abs(v).toFixed(0)}%`, direction: v >= 0 ? "up" as const : "down" as const, label: "vs. mes anterior" };
    };
    const mesActual = resumen ? `${NOMBRES_MES[resumen.mes - 1]} ${resumen.anio}` : '';

    return (
        <div className="flex flex-col gap-6">
            {/* Cabecera */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <WorkflowIcon size={26} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Órdenes de trabajo</h1>
                        <p className="mt-1 text-sm text-gray-500">Registra, importa y da seguimiento a las SOTs.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {!esTecnico && (
                        <button
                            type="button"
                            onClick={() => setImportarAbierto(true)}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                        >
                            <FileSpreadsheet size={16} />
                            Importar Excel
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => navigate('/ordenesCrear')}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-red-700"
                    >
                        + Nueva orden
                    </button>
                </div>
            </div>

            {/* Tarjetas del mes actual */}
            <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${esTecnico ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
                <StatCard
                    title={`SOTs de ${mesActual || 'este mes'}`}
                    icon={ClipboardList}
                    value={resumen?.totalSots ?? '-'}
                    trend={resumen ? tendencia(resumen.totalSots, resumen.totalSotsMesAnterior) : undefined}
                />
                {!esTecnico && (
                    <StatCard
                        title="Monto del mes"
                        icon={Wallet}
                        value={resumen ? formatoSoles(resumen.montoTotal) : '-'}
                        trend={resumen ? tendencia(resumen.montoTotal, resumen.montoTotalMesAnterior) : undefined}
                        iconClassName="bg-green-50 text-green-600"
                    />
                )}
                <StatCard
                    title="Ingresadas (pendientes)"
                    icon={Clock}
                    value={resumen ? cantidadEstado(0) : '-'}
                    iconClassName="bg-amber-50 text-amber-600"
                />
                <StatCard
                    title="Liquidadas"
                    icon={CheckCircle2}
                    value={resumen ? cantidadEstado(2) : '-'}
                    iconClassName="bg-blue-50 text-blue-600"
                />
            </div>

            {/* Tabla con filtros */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-end gap-3 border-b border-gray-100 px-6 py-4">
                    <div className="relative min-w-52 flex-1">
                        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            inputMode="numeric"
                            value={textoBusqueda}
                            onChange={(e) => setTextoBusqueda(e.target.value)}
                            placeholder="Buscar por SOT..."
                            className={`${claseInput} w-full pl-9`}
                        />
                    </div>

                    <select
                        value={estado}
                        onChange={(e) => cambiarFiltro(setEstado)(e.target.value === '' ? '' : Number(e.target.value) as EstadoOrden)}
                        className={claseInput}
                    >
                        <option value="">Todos los estados</option>
                        {Object.entries(ESTADOS_ORDEN).map(([valor, info]) => (
                            <option key={valor} value={valor}>{info.label}</option>
                        ))}
                    </select>

                    {!esTecnico && (
                        <select
                            value={tecnicoId}
                            onChange={(e) => cambiarFiltro(setTecnicoId)(e.target.value === '' ? '' : Number(e.target.value))}
                            className={`${claseInput} max-w-56`}
                        >
                            <option value="">Todos los técnicos</option>
                            {tecnicos.map((t) => (
                                <option key={t.usuarioId} value={t.usuarioId}>{t.nombre}</option>
                            ))}
                        </select>
                    )}

                    {!esTecnico && (
                        <select
                            value={auditada}
                            onChange={(e) => cambiarFiltro(setAuditada)(e.target.value as '' | 'si' | 'no')}
                            className={claseInput}
                        >
                            <option value="">Auditadas y sin auditar</option>
                            <option value="no">Sin auditar</option>
                            <option value="si">Auditadas</option>
                        </select>
                    )}

                    <label className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        Desde
                        <input type="date" value={desde} max={hasta || undefined} onChange={(e) => cambiarFiltro(setDesde)(e.target.value)} className={claseInput} />
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        Hasta
                        <input type="date" value={hasta} min={desde || undefined} onChange={(e) => cambiarFiltro(setHasta)(e.target.value)} className={claseInput} />
                    </label>

                    {hayFiltros && (
                        <button
                            type="button"
                            onClick={limpiarFiltros}
                            className="flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        >
                            <X size={16} /> Limpiar
                        </button>
                    )}
                </div>

                {/* Auditoría masiva (solo admin y almacén) */}
                {!esTecnico && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-6 py-3">
                        <p className="text-sm text-gray-500">
                            {seleccion.size > 0
                                ? <><span className="font-semibold text-gray-800">{seleccion.size}</span> {seleccion.size === 1 ? 'SOT seleccionada' : 'SOT seleccionadas'}</>
                                : 'Audita una por una las que tienen penalidad o multa; el resto, en bloque.'}
                        </p>
                        <div className="flex items-center gap-2">
                            {seleccion.size > 0 && (
                                <button
                                    type="button"
                                    onClick={() => auditarSinDescuento([...seleccion])}
                                    disabled={auditando}
                                    className="flex h-9 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-60"
                                >
                                    <ClipboardCheck size={16} /> Auditar seleccionadas
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => auditarSinDescuento()}
                                disabled={auditando}
                                title="Audita sin descuento todas las SOT pendientes que cumplen los filtros (todas las páginas)"
                                className="flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-60"
                            >
                                <ClipboardCheck size={16} /> {auditando ? 'Auditando...' : 'Auditar todo sin descuento'}
                            </button>
                        </div>
                    </div>
                )}
                {mensajeAuditoria && (
                    <p className={`mx-6 mt-3 rounded-lg border px-4 py-2.5 text-sm ${mensajeAuditoria.tipo === 'ok' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                        {mensajeAuditoria.texto}
                    </p>
                )}

                <OrdenesTable
                    ordenes={OrdenesT}
                    isLoading={isLoading}
                    onDelete={handleDelete}
                    seleccion={seleccion}
                    onSeleccionar={alternarSeleccion}
                    onSeleccionarTodas={(ids) => setSeleccion(new Set(ids))}
                    onActualizado={() => { refetch(); cargarResumen(); }}
                />

                <BarPaginancion
                    onHandle={setPagina}
                    numeroPagina={page?.numeroPagina ?? pagina}
                    totalRegistros={page?.totalRegistros ?? 0}
                    totalRegistrosPagina={page?.totalRegistrosPagina ?? 0}
                    totalPaginasTotales={page?.totalPaginasTotales ?? 1}
                />
            </div>

            <ImportarExcelModal
                isOpen={importarAbierto}
                onClose={() => setImportarAbierto(false)}
                onImportado={alImportar}
            />
        </div>
    );
};
