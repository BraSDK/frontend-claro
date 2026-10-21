import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileSpreadsheet, ClipboardList, Wallet, Clock, CheckCircle2, ClipboardCheck, Plus } from 'lucide-react';
import { FilterBar } from '../../components/ui/FilterBar';
import { Campo, Entrada, Selector, RangoFechas, Boton } from '../../components/ui/Controles';
import { DataTable, AccionTabla } from '../../components/ui/DataTable';
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

    // "Buscar" aplica el texto en el momento, sin esperar el retardo de 400 ms
    const aplicarBusqueda = () => { setBuscar(textoBusqueda.trim()); setPagina(1); };

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
        <div className="flex flex-col gap-5">
            {/* Filtros */}
            <FilterBar onBuscar={aplicarBusqueda} onLimpiar={limpiarFiltros} hayFiltros={hayFiltros}>
                <Campo label="SOT">
                    <Entrada
                        inputMode="numeric"
                        value={textoBusqueda}
                        onChange={(e) => setTextoBusqueda(e.target.value)}
                        placeholder="Ingrese el número de SOT"
                    />
                </Campo>
                <Campo label="Estado">
                    <Selector
                        value={estado}
                        onChange={(e) => cambiarFiltro(setEstado)(e.target.value === '' ? '' : Number(e.target.value) as EstadoOrden)}
                    >
                        <option value="">Todos</option>
                        {Object.entries(ESTADOS_ORDEN).map(([valor, info]) => (
                            <option key={valor} value={valor}>{info.label}</option>
                        ))}
                    </Selector>
                </Campo>
                {!esTecnico && (
                    <Campo label="Técnico">
                        <Selector
                            value={tecnicoId}
                            onChange={(e) => cambiarFiltro(setTecnicoId)(e.target.value === '' ? '' : Number(e.target.value))}
                        >
                            <option value="">Todos</option>
                            {tecnicos.map((t) => (
                                <option key={t.usuarioId} value={t.usuarioId}>{t.nombre}</option>
                            ))}
                        </Selector>
                    </Campo>
                )}
                {!esTecnico && (
                    <Campo label="Auditoría">
                        <Selector value={auditada} onChange={(e) => cambiarFiltro(setAuditada)(e.target.value as '' | 'si' | 'no')}>
                            <option value="">Todas</option>
                            <option value="no">Sin auditar</option>
                            <option value="si">Auditadas</option>
                        </Selector>
                    </Campo>
                )}
                <Campo label="Fecha de registro">
                    <RangoFechas desde={desde} hasta={hasta} onDesde={cambiarFiltro(setDesde)} onHasta={cambiarFiltro(setHasta)} />
                </Campo>
            </FilterBar>

            {/* Tarjetas del mes actual 
            <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${esTecnico ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
                <StatCard
                    title={`SOTs de ${mesActual || 'este mes'}`}
                    icon={ClipboardList}
                    value={resumen?.totalSots ?? '-'}
                    trend={resumen ? tendencia(resumen.totalSots, resumen.totalSotsMesAnterior) : undefined}
                    iconClassName="bg-danger-soft text-primary"
                />
                {!esTecnico && (
                    <StatCard
                        title="Monto del mes"
                        icon={Wallet}
                        value={resumen ? formatoSoles(resumen.montoTotal) : '-'}
                        trend={resumen ? tendencia(resumen.montoTotal, resumen.montoTotalMesAnterior) : undefined}
                        iconClassName="bg-success-soft text-success"
                    />
                )}
                <StatCard
                    title="Ingresadas (pendientes)"
                    icon={Clock}
                    value={resumen ? cantidadEstado(0) : '-'}
                    iconClassName="bg-info-soft text-info"
                />
                <StatCard
                    title="Liquidadas"
                    icon={CheckCircle2}
                    value={resumen ? cantidadEstado(2) : '-'}
                    iconClassName="bg-success-soft text-success"
                />
            </div>
*/}
            {mensajeAuditoria && (
                <p className={`rounded-control border px-4 py-2.5 text-sm ${mensajeAuditoria.tipo === 'ok' ? 'border-success/30 bg-success-soft text-success' : 'border-danger/30 bg-danger-soft text-danger'}`}>
                    {mensajeAuditoria.texto}
                </p>
            )}

            {/* Listado */}
            <DataTable
                titulo="Listado de órdenes de trabajo"
                cantidad={page?.totalRegistros ?? 0}
                acciones={
                    <>
                        {!esTecnico && seleccion.size > 0 && (
                            <AccionTabla icono={<ClipboardCheck size={16} />} onClick={() => auditarSinDescuento([...seleccion])} disabled={auditando}>
                                Auditar seleccionadas ({seleccion.size})
                            </AccionTabla>
                        )}
                        {!esTecnico && (
                            <AccionTabla
                                icono={<ClipboardCheck size={16} />}
                                onClick={() => auditarSinDescuento()}
                                disabled={auditando}
                                title="Audita sin descuento todas las SOT pendientes que cumplen los filtros (todas las páginas)"
                            >
                                {auditando ? 'Auditando...' : 'Auditar todo sin descuento'}
                            </AccionTabla>
                        )}
                        {!esTecnico && (
                            <AccionTabla icono={<FileSpreadsheet size={16} />} onClick={() => setImportarAbierto(true)}>
                                Importar Excel
                            </AccionTabla>
                        )}
                        <Boton icono={<Plus size={16} />} onClick={() => navigate('/ordenesCrear')} className="ml-1">
                            Nueva orden
                        </Boton>
                    </>
                }
                pie={
                    <BarPaginancion
                        onHandle={setPagina}
                        numeroPagina={page?.numeroPagina ?? pagina}
                        totalRegistros={page?.totalRegistros ?? 0}
                        totalRegistrosPagina={page?.totalRegistrosPagina ?? 0}
                        totalPaginasTotales={page?.totalPaginasTotales ?? 1}
                    />
                }
            >
                <OrdenesTable
                    ordenes={OrdenesT}
                    isLoading={isLoading}
                    onDelete={handleDelete}
                    seleccion={seleccion}
                    onSeleccionar={alternarSeleccion}
                    onSeleccionarTodas={(ids) => setSeleccion(new Set(ids))}
                    onActualizado={() => { refetch(); cargarResumen(); }}
                    tecnicos={tecnicos}
                    onFilaEditada={cargarResumen}
                />
            </DataTable>

            <ImportarExcelModal
                isOpen={importarAbierto}
                onClose={() => setImportarAbierto(false)}
                onImportado={alImportar}
            />
        </div>
    );
};
