import { useMemo, useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { Campo, Selector } from '../shared/Filtros';
import { Boton, AccionTabla, claseTabla, claseTh, claseTd, claseFila } from '../shared/Tabla';
import { leerExcel, letraColumna, aNumero, type TablaExcel } from '../../utils/leerExcel';
import { previsualizarPagos, auditarLiquidaciones } from '../../services/auditoria.service';
import { ESTADOS_PAGO_LIQ, etiquetaPago, type PrevisualizarAuditoriaResponse } from '../../types/auditoria.types';
import { formatoSoles } from '../../utils/formato';

interface Props {
    abierto: boolean;
    onCerrar: () => void;
    onConfirmado: (actualizadas: number) => void;
}

// Adivina la columna por su título (ej. "SOT", "Monto pagado")
const adivinar = (titulos: string[], patron: RegExp) => Math.max(0, titulos.findIndex((t) => patron.test(t.toLowerCase())));

// Pasos: 1) subir archivo  2) elegir columnas  3) comparar (vista previa)  4) confirmar
export const ImportarPagosModal = ({ abierto, onCerrar, onConfirmado }: Props) => {
    const [nombreArchivo, setNombreArchivo] = useState('');
    const [tabla, setTabla] = useState<TablaExcel | null>(null);
    const [conTitulos, setConTitulos] = useState(true);
    const [colSot, setColSot] = useState(0);
    const [colMonto, setColMonto] = useState(1);
    const [vista, setVista] = useState<PrevisualizarAuditoriaResponse | null>(null);
    const [estados, setEstados] = useState<Record<number, number>>({});   // SOT → estado elegido
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cerrar = () => {
        setNombreArchivo(''); setTabla(null); setVista(null); setEstados({}); setError(null);
        onCerrar();
    };

    // ===== Columnas del Excel =====
    const totalColumnas = useMemo(() => Math.max(0, ...(tabla ?? []).slice(0, 50).map((f) => f.length)), [tabla]);
    const titulos = useMemo(() => Array.from({ length: totalColumnas }, (_, i) => {
        const titulo = conTitulos ? String(tabla?.[0]?.[i] ?? '').trim() : '';
        return titulo ? `${letraColumna(i)} · ${titulo}` : `Columna ${letraColumna(i)}`;
    }), [tabla, conTitulos, totalColumnas]);

    const filasPago = useMemo(() => (tabla ?? []).slice(conTitulos ? 1 : 0)
        .map((f) => ({ sot: Math.trunc(aNumero(f[colSot]) ?? 0), montoPagado: aNumero(f[colMonto]) ?? 0 }))
        .filter((f) => f.sot > 0), [tabla, conTitulos, colSot, colMonto]);

    const alElegirArchivo = async (archivo?: File) => {
        if (!archivo) return;
        setError(null); setVista(null);
        try {
            const datos = await leerExcel(archivo);
            if (datos.length === 0) throw new Error('El archivo está vacío');
            const encabezado = datos[0].map((c) => String(c));
            setTabla(datos);
            setNombreArchivo(archivo.name);
            setColSot(adivinar(encabezado, /sot/));
            setColMonto(adivinar(encabezado, /monto|pag|importe|total/));
        } catch (e: any) {
            setTabla(null);
            setError(e?.message ?? 'No se pudo leer el archivo');
        }
    };

    const comparar = async () => {
        if (filasPago.length === 0) { setError('No hay SOT válidas en la columna elegida'); return; }
        setCargando(true); setError(null);
        try {
            const res = await previsualizarPagos(filasPago);
            setVista(res);
            setEstados(Object.fromEntries(res.filas.filter((f) => f.existe).map((f) => [f.sot, f.estadoSugerido])));
        } catch (e: any) {
            setError(e.response?.data?.error ?? 'No se pudo comparar con el sistema');
        } finally {
            setCargando(false);
        }
    };

    const confirmar = async () => {
        if (!vista) return;
        setCargando(true); setError(null);
        try {
            const items = vista.filas.filter((f) => f.existe).map((f) => ({
                sot: f.sot,
                estadoPago: estados[f.sot] ?? f.estadoSugerido,
                montoPagado: f.montoPagado,
                precioTotalEditable: f.precioTotalEditable ?? null,   // se conserva el precio editado que ya tenía
            }));
            const res = await auditarLiquidaciones(items);
            onConfirmado(res.actualizadas);
            cerrar();
        } catch (e: any) {
            setError(e.response?.data?.error ?? 'No se pudo guardar la auditoría');
        } finally {
            setCargando(false);
        }
    };

    return (
        <Modal isOpen={abierto} onClose={cerrar} title="Auditar con Excel de pagos" ancho="max-w-5xl">
            <div className="flex flex-col gap-4">
                {/* 1. Archivo */}
                <label className="flex cursor-pointer items-center gap-3 rounded-control border border-dashed border-line px-4 py-3 text-sm hover:border-info">
                    <FileSpreadsheet size={20} className="text-success" />
                    <span className="flex-1 text-ink">{nombreArchivo || 'Elige el Excel de pagos de Claro (.xlsx o .csv)'}</span>
                    <span className="text-info">Examinar</span>
                    <input type="file" accept=".xlsx,.csv" className="hidden" onChange={(e) => { alElegirArchivo(e.target.files?.[0]); e.target.value = ''; }} />
                </label>

                {/* 2. Columnas */}
                {tabla && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <Campo label="Columna de la SOT">
                            <Selector value={colSot} onChange={(e) => { setColSot(Number(e.target.value)); setVista(null); }}>
                                {titulos.map((t, i) => <option key={i} value={i}>{t}</option>)}
                            </Selector>
                        </Campo>
                        <Campo label="Columna del monto pagado">
                            <Selector value={colMonto} onChange={(e) => { setColMonto(Number(e.target.value)); setVista(null); }}>
                                {titulos.map((t, i) => <option key={i} value={i}>{t}</option>)}
                            </Selector>
                        </Campo>
                        <label className="flex items-end gap-2 pb-1.5 text-sm text-ink">
                            <input type="checkbox" checked={conTitulos} onChange={(e) => { setConTitulos(e.target.checked); setVista(null); }} />
                            La primera fila tiene títulos
                        </label>
                        <p className="text-sm text-muted sm:col-span-3">
                            {filasPago.length} filas con SOT en el archivo. Si una SOT aparece varias veces, se suman sus pagos.
                        </p>
                    </div>
                )}

                {error && <div className="rounded-control bg-danger-soft px-4 py-2 text-sm text-danger">{error}</div>}

                {/* 3. Vista previa */}
                {vista && (
                    <>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <span><b className="text-success">{vista.encontradas}</b> SOT encontradas</span>
                            <span><b className="text-danger">{vista.noEncontradas}</b> no existen en el sistema (no se guardan)</span>
                        </div>
                        <div className="max-h-[45vh] overflow-auto rounded-md border border-gray-200">
                            <table className={claseTabla}>
                                <thead>
                                    <tr>
                                        {['SOT', 'Técnico', 'Total a cobrar', 'Pagado', 'Diferencia', 'Estado actual', 'Nuevo estado'].map((t) => <th key={t} className={claseTh}>{t}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {vista.filas.map((f) => (
                                        <tr key={f.sot} className={f.existe ? claseFila : 'bg-danger-soft'}>
                                            <td className={`${claseTd} font-mono`}>{f.sot}</td>
                                            <td className={`${claseTd} text-left`}>{f.existe ? f.nombreTecnico : <span className="text-danger">No existe en el sistema</span>}</td>
                                            <td className={`${claseTd} text-right`}>{f.existe ? formatoSoles(f.totalACobrar) : ''}</td>
                                            <td className={`${claseTd} text-right`}>
                                                {formatoSoles(f.montoPagado)}
                                                {f.filasEnExcel > 1 && <span className="ml-1 text-xs text-muted">({f.filasEnExcel} filas)</span>}
                                            </td>
                                            <td className={`${claseTd} text-right ${!f.existe ? '' : Math.abs(f.diferencia) < 0.01 ? 'text-muted' : f.diferencia < 0 ? 'text-danger font-semibold' : 'text-success font-semibold'}`}>
                                                {f.existe ? formatoSoles(f.diferencia) : ''}
                                            </td>
                                            <td className={claseTd}>{f.existe ? etiquetaPago(f.estadoActual) : ''}</td>
                                            <td className={claseTd}>
                                                {f.existe && (
                                                    <select
                                                        className="h-7 rounded-control border border-line-input bg-surface px-1.5 text-sm"
                                                        value={estados[f.sot] ?? f.estadoSugerido}
                                                        onChange={(e) => setEstados((prev) => ({ ...prev, [f.sot]: Number(e.target.value) }))}
                                                    >
                                                        {ESTADOS_PAGO_LIQ.map((e) => <option key={e.valor} value={e.valor}>{e.label}</option>)}
                                                    </select>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* 4. Acciones */}
                <div className="flex justify-end gap-2">
                    <AccionTabla onClick={cerrar}>Cancelar</AccionTabla>
                    {!vista ? (
                        <Boton onClick={comparar} disabled={!tabla || cargando}>{cargando ? 'Comparando…' : 'Comparar con el sistema'}</Boton>
                    ) : (
                        <Boton onClick={confirmar} disabled={cargando || vista.encontradas === 0}>
                            {cargando ? 'Guardando…' : `Confirmar ${vista.encontradas} SOT`}
                        </Boton>
                    )}
                </div>
            </div>
        </Modal>
    );
};
