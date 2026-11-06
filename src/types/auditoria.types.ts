import type { ListarRequestLiquidacionesDto } from './liquidacion.types';

// EstadoPago del back (Liquidacion.EstadoPago). En la grilla se trabaja con la etiqueta
// para que copiar/pegar desde Excel funcione escribiendo "Pagó", "No pagó", etc.
export const ESTADOS_PAGO_LIQ = [
    { valor: 0, label: 'Pendiente', clase: 'bg-muted' },
    { valor: 1, label: 'Pagó', clase: 'bg-success' },
    { valor: 2, label: 'No pagó', clase: 'bg-danger' },
    { valor: 3, label: 'Incompleto', clase: 'bg-warning' },
    { valor: 4, label: 'Observado', clase: 'bg-info' },
] as const;

export const ETIQUETAS_PAGO = ESTADOS_PAGO_LIQ.map((e) => e.label);

export const etiquetaPago = (valor?: number) => ESTADOS_PAGO_LIQ.find((e) => e.valor === valor)?.label ?? 'Pendiente';

// Acepta la etiqueta con o sin tildes/mayúsculas, el número (0-4) o sinónimos comunes del Excel
const SINONIMOS: Record<string, number> = {
    pendiente: 0,
    pago: 1, pagado: 1, pagada: 1, 'si pago': 1, si: 1,
    'no pago': 2, 'no pagado': 2, 'no pagada': 2, 'no pagara': 2, no: 2,
    incompleto: 3, incompleta: 3, parcial: 3,
    observado: 4, observada: 4, observacion: 4,
};

export const estadoDesdeTexto = (texto: unknown): number | null => {
    const t = String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
    if (t === '') return 0;
    if (/^[0-4]$/.test(t)) return Number(t);
    return SINONIMOS[t] ?? null;
};

// ===== Lo que lista el back para la auditoría (mismo endpoint de Listar) =====
export interface LiquidacionAuditoriaDto extends ListarRequestLiquidacionesDto {
    precioTotalReal?: number | null;
    montoPagado?: number | null;
    estadoPago?: number;
    fechaValidacion?: string | null;
}

export interface PagedResponse<T> {
    listaGenerica: T[];
    numeroPagina: number;
    tamanoPagina: number;
    totalRegistros: number;
    totalRegistrosPagina: number;
}

export interface ParamsAuditoria {
    pagina: number;
    canPagina: number;
    buscar?: string;
    estadoPago?: number;
    auditada?: boolean;
}

// Fila plana de la grilla de auditoría
export interface FilaAuditoria {
    sot: number;
    tecnico?: string;
    fechaProgramacion?: string;
    precioTotalReal?: number | null;            // calculado por el sistema (no se edita aquí)
    precioEditado?: number | string | null;     // el que se cobra si existe (PrecioTotalEditable)
    montoPagado?: number | string | null;
    estado?: string;                            // etiqueta de ESTADOS_PAGO_LIQ
}

// ===== Excel de pagos =====
export interface FilaPagoExcel {
    sot: number;
    montoPagado: number;
}

export interface FilaAuditoriaPreview {
    sot: number;
    existe: boolean;
    nombreTecnico?: string | null;
    precioTotalReal?: number | null;
    precioTotalEditable?: number | null;
    totalACobrar: number;
    montoPagado: number;
    diferencia: number;
    filasEnExcel: number;
    estadoActual: number;
    estadoSugerido: number;
}

export interface PrevisualizarAuditoriaResponse {
    filas: FilaAuditoriaPreview[];
    encontradas: number;
    noEncontradas: number;
}

export interface AuditarLiquidacionItem {
    sot: number;
    estadoPago: number;
    montoPagado: number | null;
    precioTotalEditable: number | null;
}

export interface AuditarLiquidacionesResponse {
    actualizadas: number;
    noEncontradas: number[];
    nuevasImportadas: number;
    sotsNuevas: number[];
    enPago: number[];   // ya están en un pago de Claro registrado: su auditoría no se cambia
}
