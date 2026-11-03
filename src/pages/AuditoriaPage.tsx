import { useCallback, useEffect, useMemo, useState } from 'react';
import { RevoGrid } from '@revolist/react-datagrid';
import ColumnSelect from '@revolist/revogrid-column-select';
import { FileSpreadsheet } from 'lucide-react';
import { temaClaro } from '@/theme/revogrid-theme';
import { FilterBar, Campo, Entrada, Selector } from '@/components/shared/Filtros';
import { DataTable, AccionTabla, BarPaginancion } from '@/components/shared/Tabla';
import { getAuditoriaColumns } from '@/components/Auditoria/auditoriaColumns';
import { ImportarPagosModal } from '@/components/Auditoria/ImportarPagosModal';
import { getLiquidacionesAuditoria, auditarLiquidaciones } from '@/services/auditoria.service';
import { aNumero } from '@/utils/leerExcel';
import {
    ESTADOS_PAGO_LIQ, estadoDesdeTexto, etiquetaPago,
    type FilaAuditoria, type LiquidacionAuditoriaDto, type PagedResponse, type ParamsAuditoria,
} from '@/types/auditoria.types';

const CAN_PAGINA = 50;   // máximo que acepta el back

// Del listado del back a la fila plana de la grilla
const aFila = (l: LiquidacionAuditoriaDto): FilaAuditoria => ({
    sot: l.sot,
    tecnico: l.nombreTecnico,
    fechaProgramacion: l.fechaProgramacion,
    precioTotalReal: l.precioTotalReal ?? 0,
    precioEditado: l.precioTotalEditable ?? null,
    montoPagado: l.montoPagado ?? null,
    estado: etiquetaPago(l.estadoPago),
});

export const AuditoriaPage = () => {
    const [params, setParams] = useState<ParamsAuditoria>({ pagina: 1, canPagina: CAN_PAGINA });
    const [datos, setDatos] = useState<PagedResponse<LiquidacionAuditoriaDto> | null>(null);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
    const [importarAbierto, setImportarAbierto] = useState(false);

    // filtros (se aplican al apretar Buscar)
    const [buscar, setBuscar] = useState('');
    const [estadoPago, setEstadoPago] = useState('');
    const [auditada, setAuditada] = useState('');
    const hayFiltros = Boolean(buscar || estadoPago || auditada);

    const columnas = useMemo(() => getAuditoriaColumns(), []);
    const tiposColumna = useMemo(() => ({ select: new ColumnSelect() }), []);
    const filas = useMemo(() => (datos?.listaGenerica ?? []).map(aFila), [datos]);

    const cargar = useCallback(async () => {
        setCargando(true);
        try {
            setDatos(await getLiquidacionesAuditoria(params));
        } catch {
            setMensaje({ tipo: 'error', texto: 'No se pudieron cargar las liquidaciones' });
        } finally {
            setCargando(false);
        }
    }, [params]);

    useEffect(() => { cargar(); }, [cargar]);

    const aplicarFiltros = () => setParams({
        pagina: 1, canPagina: CAN_PAGINA,
        buscar: buscar.trim() || undefined,
        estadoPago: estadoPago === '' ? undefined : Number(estadoPago),
        auditada: auditada === '' ? undefined : auditada === 'true',
    });

    const limpiarFiltros = () => {
        setBuscar(''); setEstadoPago(''); setAuditada('');
        setParams({ pagina: 1, canPagina: CAN_PAGINA });
    };

    // Auditoría manual: edición de una celda (detail.model) o pegado/autollenado (detail.models + detail.data).
    // Se guarda la fila completa: estado, pagado y precio editado.
    const alEditar = async (e: CustomEvent) => {
        const d = e.detail;
        const editadas: FilaAuditoria[] = d.models
            ? Object.keys(d.models).map((i) => ({ ...d.models[i], ...d.data?.[i] }))
            : [d.model];

        const errores: string[] = [];
        const items = editadas.filter((f) => Number(f?.sot) > 0).flatMap((f) => {
            const estado = estadoDesdeTexto(f.estado);
            if (estado === null) { errores.push(`SOT ${f.sot}: "${f.estado}" no es un estado válido`); return []; }
            return [{
                sot: Number(f.sot),
                estadoPago: estado,
                montoPagado: aNumero(f.montoPagado),
                precioTotalEditable: aNumero(f.precioEditado),   // vacío = se cobra el calculado
            }];
        });

        if (items.length > 0) {
            try {
                const res = await auditarLiquidaciones(items);
                if (res.noEncontradas.length) errores.push(`No existen: ${res.noEncontradas.join(', ')}`);
                if (res.enPago?.length) errores.push(`Ya están en un pago registrado (para cambiarlas, elimina ese pago en Pagos Claro): ${res.enPago.join(', ')}`);
                if (!errores.length) setMensaje({ tipo: 'ok', texto: `${res.actualizadas} SOT guardada(s)` });
            } catch {
                errores.push('No se pudo guardar la auditoría');
            }
        }
        if (errores.length) setMensaje({ tipo: 'error', texto: errores.join(' · ') });
        await cargar();   // trae los valores guardados (y deshace lo inválido)
    };

    const total = datos?.totalRegistros ?? 0;

    return (
        <div className="flex flex-col gap-5">
            <FilterBar onBuscar={aplicarFiltros} onLimpiar={limpiarFiltros} hayFiltros={hayFiltros}>
                <Campo label="SOT">
                    <Entrada inputMode="numeric" value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Ingrese el número de SOT" />
                </Campo>
                <Campo label="Estado de pago">
                    <Selector value={estadoPago} onChange={(e) => setEstadoPago(e.target.value)}>
                        <option value="">Todos</option>
                        {ESTADOS_PAGO_LIQ.map((e) => <option key={e.valor} value={e.valor}>{e.label}</option>)}
                    </Selector>
                </Campo>
                <Campo label="Auditada">
                    <Selector value={auditada} onChange={(e) => setAuditada(e.target.value)}>
                        <option value="">Todas</option>
                        <option value="true">Sí</option>
                        <option value="false">No</option>
                    </Selector>
                </Campo>
            </FilterBar>

            {mensaje && (
                <div className={`rounded-control px-4 py-2 text-sm ${mensaje.tipo === 'ok' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                    {mensaje.texto}
                </div>
            )}

            <DataTable
                titulo="Auditoría de liquidaciones"
                cantidad={total}
                acciones={
                    <AccionTabla icono={<FileSpreadsheet size={16} />} onClick={() => setImportarAbierto(true)}>
                        Subir Excel de pagos
                    </AccionTabla>
                }
                pie={
                    <BarPaginancion
                        onHandle={(pagina) => setParams((p) => ({ ...p, pagina }))}
                        numeroPagina={params.pagina}
                        totalRegistros={total}
                        totalRegistrosPagina={CAN_PAGINA}
                        totalPaginasTotales={Math.max(1, Math.ceil(total / CAN_PAGINA))}
                    />
                }
            >
                <div className="relative w-full" style={{ height: 'calc(100vh - 360px)', minHeight: '400px' }}>
                    {cargando && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                            <span className="text-sm font-medium text-gray-500">Cargando…</span>
                        </div>
                    )}
                    <RevoGrid
                        columns={columnas}
                        source={filas}
                        theme={temaClaro.name}
                        rowSize={45}
                        range={true}
                        useClipboard={true}
                        resize={true}
                        stretch={true}
                        columnTypes={tiposColumna}
                        onAfteredit={alEditar}
                    />
                </div>
            </DataTable>

            <ImportarPagosModal
                abierto={importarAbierto}
                onCerrar={() => setImportarAbierto(false)}
                onConfirmado={(n) => { setMensaje({ tipo: 'ok', texto: `Auditoría con Excel: ${n} SOT actualizadas` }); cargar(); }}
            />
        </div>
    );
};
