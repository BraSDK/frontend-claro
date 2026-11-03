import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../shared/Modal';
import { Campo, Entrada, AreaTexto, RangoFechas } from '../shared/Filtros';
import { AccionTabla, Boton, claseTabla, claseTh, claseTd, claseFila } from '../shared/Tabla';
import { EstadoPagoTexto } from './EstadoPagoTexto';
import { crearPagoClaro, getMultasClaro, getSotsPendientesPago, mensajeError } from '../../services/pagosClaro.service';
import type { MultaClaro, SotPago } from '../../types/pagosClaro.types';
import { formatoFechaCorta, formatoSoles } from '../../utils/formato';

interface Props {
    abierto: boolean;
    onCerrar: () => void;
    onRegistrado: () => void;
}

const hoy = () => new Date().toLocaleDateString('en-CA');   // 'YYYY-MM-DD' en hora local

// Registrar un pago de Claro: se eligen las SOT ya auditadas que cubre y las multas que Claro descontó en él
export const RegistrarPagoModal = ({ abierto, onCerrar, onRegistrado }: Props) => {
    const [fechaPago, setFechaPago] = useState(hoy());
    const [comprobante, setComprobante] = useState('');
    const [observacion, setObservacion] = useState('');

    // filtro por fecha de auditoría de las SOT pendientes
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');

    const [sots, setSots] = useState<SotPago[]>([]);
    const [multas, setMultas] = useState<MultaClaro[]>([]);
    const [sotsElegidas, setSotsElegidas] = useState<Set<number>>(new Set());
    const [multasElegidas, setMultasElegidas] = useState<Set<number>>(new Set());

    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // al abrir (o cambiar el rango): trae las SOT auditadas sin pago y las multas pendientes; todo queda marcado
    useEffect(() => {
        if (!abierto) return;
        let activo = true;
        setCargando(true); setError(null);
        Promise.all([
            getSotsPendientesPago({ desde: desde || undefined, hasta: hasta || undefined }),
            getMultasClaro({ soloPendientes: true }),
        ])
            .then(([s, m]) => {
                if (!activo) return;
                setSots(s); setMultas(m);
                setSotsElegidas(new Set(s.map((x) => x.sot)));
                setMultasElegidas(new Set(m.map((x) => x.multaClaroId)));
            })
            .catch((e) => activo && setError(mensajeError(e, 'No se pudieron cargar las SOT auditadas')))
            .finally(() => activo && setCargando(false));
        return () => { activo = false; };
    }, [abierto, desde, hasta]);

    const cerrar = () => {
        setComprobante(''); setObservacion(''); setFechaPago(hoy()); setDesde(''); setHasta(''); setError(null);
        onCerrar();
    };

    const alternar = <T,>(set: Set<T>, valor: T) => {
        const nuevo = new Set(set);
        if (nuevo.has(valor)) nuevo.delete(valor); else nuevo.add(valor);
        return nuevo;
    };

    const totales = useMemo(() => {
        const elegidas = sots.filter((s) => sotsElegidas.has(s.sot));
        const pagado = elegidas.reduce((t, s) => t + s.montoPagado, 0);
        const multado = multas.filter((m) => multasElegidas.has(m.multaClaroId)).reduce((t, m) => t + m.monto, 0);
        return { cantidad: elegidas.length, cobrar: elegidas.reduce((t, s) => t + s.totalACobrar, 0), pagado, multado, neto: pagado - multado };
    }, [sots, multas, sotsElegidas, multasElegidas]);

    const registrar = async () => {
        if (!comprobante.trim()) { setError('Ingresa el n° de comprobante del pago'); return; }
        if (totales.cantidad === 0) { setError('Elige al menos una SOT'); return; }
        setGuardando(true); setError(null);
        try {
            await crearPagoClaro({
                fechaPago,
                comprobante: comprobante.trim(),
                observacion: observacion.trim() || undefined,
                sots: [...sotsElegidas],
                multaIds: [...multasElegidas],
            });
            onRegistrado();
            cerrar();
        } catch (e) {
            setError(mensajeError(e, 'No se pudo registrar el pago'));
        } finally {
            setGuardando(false);
        }
    };

    const todasMarcadas = sots.length > 0 && sotsElegidas.size === sots.length;

    return (
        <Modal isOpen={abierto} onClose={cerrar} title="Registrar pago de Claro" ancho="max-w-5xl">
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Campo label="Fecha de pago" obligatorio>
                        <Entrada type="date" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} />
                    </Campo>
                    <Campo label="N° de comprobante" obligatorio>
                        <Entrada value={comprobante} maxLength={60} onChange={(e) => setComprobante(e.target.value)} placeholder="Ej: F001-000123" />
                    </Campo>
                    <Campo label="SOT auditadas entre">
                        <RangoFechas desde={desde} hasta={hasta} onDesde={setDesde} onHasta={setHasta} />
                    </Campo>
                    <Campo label="Observación" className="sm:col-span-3">
                        <AreaTexto value={observacion} maxLength={300} onChange={(e) => setObservacion(e.target.value)} placeholder="Opcional" />
                    </Campo>
                </div>

                {/* SOT auditadas pendientes de pago */}
                <div>
                    <p className="mb-2 text-sm font-semibold text-ink">
                        SOT auditadas sin pago registrado <span className="font-normal text-muted">({sotsElegidas.size} de {sots.length} elegidas)</span>
                    </p>
                    <div className="max-h-[38vh] overflow-auto rounded-md border border-gray-200">
                        <table className={claseTabla}>
                            <thead>
                                <tr>
                                    <th className={`${claseTh} w-10`}>
                                        <input
                                            type="checkbox"
                                            aria-label="Elegir todas"
                                            checked={todasMarcadas}
                                            onChange={() => setSotsElegidas(todasMarcadas ? new Set() : new Set(sots.map((s) => s.sot)))}
                                        />
                                    </th>
                                    {['SOT', 'Técnico', 'Auditada', 'Estado', 'A cobrar', 'Pagado'].map((t) => <th key={t} className={claseTh}>{t}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {cargando && <tr><td colSpan={7} className={`${claseTd} text-muted`}>Cargando…</td></tr>}
                                {!cargando && sots.length === 0 && (
                                    <tr><td colSpan={7} className={`${claseTd} text-muted`}>No hay SOT auditadas pendientes. Primero audítalas en Auditoría de liquidaciones.</td></tr>
                                )}
                                {!cargando && sots.map((s) => (
                                    <tr key={s.sot} className={`${claseFila} cursor-pointer`} onClick={() => setSotsElegidas((v) => alternar(v, s.sot))}>
                                        <td className={claseTd}><input type="checkbox" readOnly checked={sotsElegidas.has(s.sot)} aria-label={`Elegir SOT ${s.sot}`} /></td>
                                        <td className={`${claseTd} font-mono`}>{s.sot}</td>
                                        <td className={`${claseTd} text-left`}>{s.nombreTecnico}</td>
                                        <td className={claseTd}>{formatoFechaCorta(s.fechaValidacion)}</td>
                                        <td className={claseTd}><EstadoPagoTexto estado={s.estadoPago} /></td>
                                        <td className={`${claseTd} text-right`}>{formatoSoles(s.totalACobrar)}</td>
                                        <td className={`${claseTd} text-right`}>{formatoSoles(s.montoPagado)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Multas generales pendientes de descontar */}
                {multas.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm font-semibold text-ink">Multas que Claro descontó en este pago</p>
                        <ul className="flex flex-col divide-y divide-line rounded-md border border-gray-200">
                            {multas.map((m) => (
                                <li key={m.multaClaroId}>
                                    <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-hover">
                                        <input type="checkbox" checked={multasElegidas.has(m.multaClaroId)} onChange={() => setMultasElegidas((v) => alternar(v, m.multaClaroId))} />
                                        <span className="w-24 text-muted">{formatoFechaCorta(m.fecha)}</span>
                                        <span className="flex-1 text-ink">{m.motivo}{m.nombreTecnico && <span className="text-muted"> · {m.nombreTecnico}</span>}</span>
                                        <span className="font-medium text-danger">- {formatoSoles(m.monto)}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Resumen */}
                <div className="flex flex-wrap justify-end gap-x-6 gap-y-1 rounded-md bg-page px-4 py-2 text-sm">
                    <span>{totales.cantidad} SOT</span>
                    <span>A cobrar: <b>{formatoSoles(totales.cobrar)}</b></span>
                    <span>Pagado: <b className="text-success">{formatoSoles(totales.pagado)}</b></span>
                    <span>Multas: <b className="text-danger">- {formatoSoles(totales.multado)}</b></span>
                    <span>Neto: <b className="text-ink">{formatoSoles(totales.neto)}</b></span>
                </div>

                {error && <div className="rounded-control bg-danger-soft px-4 py-2 text-sm text-danger">{error}</div>}

                <div className="flex justify-end gap-2">
                    <AccionTabla onClick={cerrar}>Cancelar</AccionTabla>
                    <Boton onClick={registrar} disabled={guardando || cargando || totales.cantidad === 0}>
                        {guardando ? 'Registrando…' : `Registrar pago (${totales.cantidad} SOT)`}
                    </Boton>
                </div>
            </div>
        </Modal>
    );
};
