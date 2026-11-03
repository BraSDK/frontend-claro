import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { AccionTabla, claseTabla, claseTh, claseTd, claseFila } from '../shared/Tabla';
import { EstadoPagoTexto } from './EstadoPagoTexto';
import { eliminarPagoClaro, getPagoClaro, mensajeError } from '../../services/pagosClaro.service';
import type { PagoClaroDetalle } from '../../types/pagosClaro.types';
import { formatoFechaCorta, formatoSoles } from '../../utils/formato';

interface Props {
    pagoId: number | null;          // null = cerrado
    puedeEliminar: boolean;         // solo ADMIN
    onCerrar: () => void;
    onEliminado: () => void;
}

// Detalle de un pago de Claro: sus SOT y las multas descontadas
export const DetallePagoModal = ({ pagoId, puedeEliminar, onCerrar, onEliminado }: Props) => {
    const [pago, setPago] = useState<PagoClaroDetalle | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [eliminando, setEliminando] = useState(false);

    useEffect(() => {
        if (pagoId === null) { setPago(null); return; }
        let activo = true;
        setError(null);
        getPagoClaro(pagoId)
            .then((p) => activo && setPago(p))
            .catch((e) => activo && setError(mensajeError(e, 'No se pudo cargar el pago')));
        return () => { activo = false; };
    }, [pagoId]);

    const eliminar = async () => {
        if (!pago || !window.confirm(`¿Eliminar el pago ${pago.comprobante}? Sus ${pago.cantidadSots} SOT y multas vuelven a quedar pendientes.`)) return;
        setEliminando(true);
        try {
            await eliminarPagoClaro(pago.pagoClaroId);
            onEliminado();
            onCerrar();
        } catch (e) {
            setError(mensajeError(e, 'No se pudo eliminar el pago'));
        } finally {
            setEliminando(false);
        }
    };

    return (
        <Modal isOpen={pagoId !== null} onClose={onCerrar} title={pago ? `Pago ${pago.comprobante} · ${formatoFechaCorta(pago.fechaPago)}` : 'Pago de Claro'} ancho="max-w-4xl">
            {!pago && !error && <p className="text-sm text-muted">Cargando…</p>}
            {error && <div className="mb-3 rounded-control bg-danger-soft px-4 py-2 text-sm text-danger">{error}</div>}
            {pago && (
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                        <Dato titulo="SOT" valor={`${pago.cantidadSots}`} detalle={`${pago.pagadas} pagó · ${pago.incompletas} incompl. · ${pago.noPagadas} no pagó`} />
                        <Dato titulo="Pagado" valor={formatoSoles(pago.montoPagado)} detalle={`de ${formatoSoles(pago.totalACobrar)} a cobrar`} clase="text-success" />
                        <Dato titulo="Multas" valor={`- ${formatoSoles(pago.montoMultas)}`} clase="text-danger" />
                        <Dato titulo="Neto" valor={formatoSoles(pago.neto)} />
                    </div>
                    {pago.observacion && <p className="rounded-md bg-page px-3 py-2 text-sm text-label">{pago.observacion}</p>}

                    <div className="max-h-[40vh] overflow-auto rounded-md border border-gray-200">
                        <table className={claseTabla}>
                            <thead>
                                <tr>{['SOT', 'Técnico', 'Programada', 'Estado', 'A cobrar', 'Pagado', 'Diferencia'].map((t) => <th key={t} className={claseTh}>{t}</th>)}</tr>
                            </thead>
                            <tbody>
                                {pago.sotsDetalle.map((s) => {
                                    const diferencia = s.montoPagado - s.totalACobrar;
                                    return (
                                        <tr key={s.sot} className={claseFila}>
                                            <td className={`${claseTd} font-mono`}>{s.sot}</td>
                                            <td className={`${claseTd} text-left`}>{s.nombreTecnico}</td>
                                            <td className={claseTd}>{formatoFechaCorta(s.fechaProgramacion)}</td>
                                            <td className={claseTd}><EstadoPagoTexto estado={s.estadoPago} /></td>
                                            <td className={`${claseTd} text-right`}>{formatoSoles(s.totalACobrar)}</td>
                                            <td className={`${claseTd} text-right`}>{formatoSoles(s.montoPagado)}</td>
                                            <td className={`${claseTd} text-right ${Math.abs(diferencia) < 0.01 ? 'text-muted' : diferencia < 0 ? 'font-semibold text-danger' : 'font-semibold text-success'}`}>
                                                {formatoSoles(diferencia)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {pago.multasDetalle.length > 0 && (
                        <ul className="flex flex-col divide-y divide-line rounded-md border border-gray-200 text-sm">
                            {pago.multasDetalle.map((m) => (
                                <li key={m.multaClaroId} className="flex items-center gap-3 px-3 py-2">
                                    <span className="w-24 text-muted">{formatoFechaCorta(m.fecha)}</span>
                                    <span className="flex-1 text-ink">{m.motivo}{m.nombreTecnico && <span className="text-muted"> · {m.nombreTecnico}</span>}</span>
                                    <span className="font-medium text-danger">- {formatoSoles(m.monto)}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="flex justify-between gap-2">
                        {puedeEliminar
                            ? <AccionTabla icono={<Trash2 size={15} />} onClick={eliminar} disabled={eliminando} className="text-danger hover:bg-danger-soft">Eliminar pago</AccionTabla>
                            : <span />}
                        <AccionTabla onClick={onCerrar}>Cerrar</AccionTabla>
                    </div>
                </div>
            )}
        </Modal>
    );
};

const Dato = ({ titulo, valor, detalle, clase = 'text-ink' }: { titulo: string; valor: string; detalle?: string; clase?: string }) => (
    <div className="rounded-md border border-line-soft px-3 py-2">
        <p className="text-xs text-label">{titulo}</p>
        <p className={`text-lg font-bold ${clase}`}>{valor}</p>
        {detalle && <p className="text-xs text-muted">{detalle}</p>}
    </div>
);
