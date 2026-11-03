import { useCallback, useEffect, useMemo, useState } from 'react';
import { Banknote, Receipt, ClipboardCheck, AlertTriangle, Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { FilterBar, Campo, RangoFechas } from '@/components/shared/Filtros';
import { DataTable, Boton, claseTabla, claseTh, claseTd, claseFila, FilasRelleno } from '@/components/shared/Tabla';
import { StatCard } from '@/components/shared/Cards';
import { RegistrarPagoModal } from '../components/PagosClaro/RegistrarPagoModal';
import { DetallePagoModal } from '../components/PagosClaro/DetallePagoModal';
import { MultaModal } from '../components/PagosClaro/MultaModal';
import {
    eliminarMultaClaro, getMultasClaro, getPagosClaro, getSotsPendientesPago, mensajeError,
} from '../services/pagosClaro.service';
import type { MultaClaro, PagoClaroResumen } from '../types/pagosClaro.types';
import { useAuth } from '../hooks/useAuth';
import { formatoFechaCorta, formatoSoles } from '../utils/formato';

type Pestana = 'pagos' | 'multas';

// Pagos Claro: registro de los pagos (lotes de SOT ya auditadas) y de las multas generales de Claro
export const PagosClaroPage = () => {
    const { rol } = useAuth();
    const esAdmin = rol === 'ADMIN';

    const [pestana, setPestana] = useState<Pestana>('pagos');

    // filtro por fecha (de pago en Pagos, de la multa en Multas); se aplica al apretar Buscar
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const [rango, setRango] = useState<{ desde?: string; hasta?: string }>({});

    const [pagos, setPagos] = useState<PagoClaroResumen[]>([]);
    const [multas, setMultas] = useState<MultaClaro[]>([]);
    const [sotsPendientes, setSotsPendientes] = useState(0);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [registrarAbierto, setRegistrarAbierto] = useState(false);
    const [pagoAbierto, setPagoAbierto] = useState<number | null>(null);
    const [multaEditar, setMultaEditar] = useState<MultaClaro | null>(null);
    const [multaAbierta, setMultaAbierta] = useState(false);

    const cargar = useCallback(async () => {
        setCargando(true); setError(null);
        try {
            const [p, m, pendientes] = await Promise.all([getPagosClaro(rango), getMultasClaro(rango), getSotsPendientesPago()]);
            setPagos(p); setMultas(m); setSotsPendientes(pendientes.length);
        } catch (e) {
            setError(mensajeError(e, 'No se pudieron cargar los pagos'));
        } finally {
            setCargando(false);
        }
    }, [rango]);

    useEffect(() => { cargar(); }, [cargar]);

    const aplicarFiltros = () => setRango({ desde: desde || undefined, hasta: hasta || undefined });
    const limpiarFiltros = () => { setDesde(''); setHasta(''); setRango({}); };

    const totales = useMemo(() => ({
        pagado: pagos.reduce((t, p) => t + p.montoPagado, 0),
        multas: multas.reduce((t, m) => t + m.monto, 0),
        multasPendientes: multas.filter((m) => !m.pagoClaroId).length,
    }), [pagos, multas]);

    const eliminarMulta = async (m: MultaClaro) => {
        if (!window.confirm(`¿Eliminar la multa "${m.motivo}" de ${formatoSoles(m.monto)}?`)) return;
        try {
            await eliminarMultaClaro(m.multaClaroId);
            await cargar();
        } catch (e) {
            setError(mensajeError(e, 'No se pudo eliminar la multa'));
        }
    };

    const abrirMulta = (m: MultaClaro | null) => { setMultaEditar(m); setMultaAbierta(true); };

    return (
        <div className="flex flex-col gap-5">
            <FilterBar onBuscar={aplicarFiltros} onLimpiar={limpiarFiltros} hayFiltros={Boolean(desde || hasta)}>
                <Campo label={pestana === 'pagos' ? 'Fecha de pago' : 'Fecha de la multa'}>
                    <RangoFechas desde={desde} hasta={hasta} onDesde={setDesde} onHasta={setHasta} />
                </Campo>
            </FilterBar>

            {error && <div className="rounded-control bg-danger-soft px-4 py-2 text-sm text-danger">{error}</div>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Pagos registrados" icon={Receipt} value={pagos.length} iconClassName="bg-info-soft text-info" />
                <StatCard title="Total pagado por Claro" icon={Banknote} value={formatoSoles(totales.pagado)} iconClassName="bg-success-soft text-success" />
                <StatCard title="Multas" icon={AlertTriangle} value={formatoSoles(totales.multas)} iconClassName="bg-danger-soft text-danger" />
                <StatCard title="SOT auditadas sin pago" icon={ClipboardCheck} value={sotsPendientes} iconClassName="bg-warning-soft text-warning" />
            </div>

            {/* Pestañas */}
            <div className="flex gap-1 border-b border-line">
                {([['pagos', `Pagos (${pagos.length})`], ['multas', `Multas (${multas.length})`]] as const).map(([valor, texto]) => (
                    <button
                        key={valor}
                        type="button"
                        onClick={() => setPestana(valor)}
                        className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                            pestana === valor ? 'border-primary text-ink' : 'border-transparent text-label hover:text-ink'
                        }`}
                    >
                        {texto}
                    </button>
                ))}
            </div>

            {pestana === 'pagos' ? (
                <DataTable
                    titulo="Pagos de Claro"
                    cantidad={pagos.length}
                    acciones={<Boton icono={<Plus size={16} />} onClick={() => setRegistrarAbierto(true)}>Registrar pago</Boton>}
                >
                    <table className={claseTabla}>
                        <thead>
                            <tr>
                                {['Fecha de pago', 'Comprobante', 'SOT', 'Pagó', 'Incompl.', 'No pagó', 'A cobrar', 'Pagado', 'Multas', 'Neto', ''].map((t, i) => (
                                    <th key={i} className={claseTh}>{t}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {cargando && pagos.length === 0 && <tr><td colSpan={11} className={`${claseTd} text-muted`}>Cargando…</td></tr>}
                            {pagos.map((p) => (
                                <tr key={p.pagoClaroId} className={`${claseFila} cursor-pointer`} onClick={() => setPagoAbierto(p.pagoClaroId)}>
                                    <td className={claseTd}>{formatoFechaCorta(p.fechaPago)}</td>
                                    <td className={`${claseTd} font-medium`}>{p.comprobante}</td>
                                    <td className={claseTd}>{p.cantidadSots}</td>
                                    <td className={`${claseTd} text-success`}>{p.pagadas}</td>
                                    <td className={`${claseTd} text-warning`}>{p.incompletas}</td>
                                    <td className={`${claseTd} text-danger`}>{p.noPagadas}</td>
                                    <td className={`${claseTd} text-right`}>{formatoSoles(p.totalACobrar)}</td>
                                    <td className={`${claseTd} text-right text-success`}>{formatoSoles(p.montoPagado)}</td>
                                    <td className={`${claseTd} text-right text-danger`}>{p.montoMultas ? `- ${formatoSoles(p.montoMultas)}` : '—'}</td>
                                    <td className={`${claseTd} text-right font-semibold`}>{formatoSoles(p.neto)}</td>
                                    <td className={claseTd}><ChevronRight size={16} className="text-muted" /></td>
                                </tr>
                            ))}
                            {!cargando && pagos.length === 0 && (
                                <tr><td colSpan={11} className={`${claseTd} text-muted`}>Aún no hay pagos registrados. Usa “Registrar pago” con las SOT ya auditadas.</td></tr>
                            )}
                            <FilasRelleno actuales={pagos.length} minimo={8} columnas={11} />
                        </tbody>
                    </table>
                </DataTable>
            ) : (
                <DataTable
                    titulo="Multas de Claro"
                    cantidad={multas.length}
                    acciones={<Boton icono={<Plus size={16} />} onClick={() => abrirMulta(null)}>Nueva multa</Boton>}
                >
                    <table className={claseTabla}>
                        <thead>
                            <tr>{['Fecha', 'Motivo', 'Técnico', 'Monto', 'Descontada en', ''].map((t, i) => <th key={i} className={claseTh}>{t}</th>)}</tr>
                        </thead>
                        <tbody>
                            {multas.map((m) => (
                                <tr key={m.multaClaroId} className={claseFila}>
                                    <td className={claseTd}>{formatoFechaCorta(m.fecha)}</td>
                                    <td className={`${claseTd} text-left`}>{m.motivo}</td>
                                    <td className={`${claseTd} text-left`}>{m.nombreTecnico ?? '—'}</td>
                                    <td className={`${claseTd} text-right font-medium text-danger`}>{formatoSoles(m.monto)}</td>
                                    <td className={claseTd}>
                                        {m.pagoClaroId
                                            ? <button type="button" className="text-info hover:underline" onClick={() => setPagoAbierto(m.pagoClaroId!)}>{m.comprobantePago}</button>
                                            : <span className="rounded-badge bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning">Pendiente</span>}
                                    </td>
                                    <td className={claseTd}>
                                        <div className="flex items-center justify-center gap-1">
                                            <button type="button" title="Editar" onClick={() => abrirMulta(m)} className="rounded p-1 text-label hover:bg-hover"><Pencil size={15} /></button>
                                            {!m.pagoClaroId && (
                                                <button type="button" title="Eliminar" onClick={() => eliminarMulta(m)} className="rounded p-1 text-label hover:bg-danger-soft hover:text-danger"><Trash2 size={15} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!cargando && multas.length === 0 && (
                                <tr><td colSpan={6} className={`${claseTd} text-muted`}>No hay multas registradas.</td></tr>
                            )}
                            <FilasRelleno actuales={multas.length} minimo={8} columnas={6} />
                        </tbody>
                    </table>
                    {totales.multasPendientes > 0 && (
                        <p className="mt-3 text-sm text-label">{totales.multasPendientes} multa(s) pendiente(s): se descuentan al registrar el próximo pago.</p>
                    )}
                </DataTable>
            )}

            <RegistrarPagoModal abierto={registrarAbierto} onCerrar={() => setRegistrarAbierto(false)} onRegistrado={cargar} />
            <DetallePagoModal pagoId={pagoAbierto} puedeEliminar={esAdmin} onCerrar={() => setPagoAbierto(null)} onEliminado={cargar} />
            <MultaModal abierto={multaAbierta} multa={multaEditar} onCerrar={() => setMultaAbierta(false)} onGuardado={cargar} />
        </div>
    );
};
