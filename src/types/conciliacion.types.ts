// Categoría de cada SOT (coincide con el enum CategoriaConciliacion del back)
import type { EstadoPago } from './Ordenes';

export const CategoriaConciliacion = {
    CUADRA: 0,
    DIFERENCIA: 1,
    NO_PAGADA: 2,
    POR_AUDITAR: 3,
} as const;
export type CategoriaConciliacion = typeof CategoriaConciliacion[keyof typeof CategoriaConciliacion];

export interface ConciliacionRequest {
    anio?: number;
    mes?: number;
    categoria?: CategoriaConciliacion;
    buscar?: string;
    tecnicoId?: number;
    conEvidencia?: boolean;
    categoriaServicio?: number;   // 0 HFC, 1 FTH, 2 MANTTO
    apelacion?: boolean;
    estadoPago?: EstadoPago;
    pagina?: number;
    canPagina?: number;
}

export interface FilaConciliacion {
    ordenId: number;
    sot: number;
    fecha: string;
    usuarioId: number;
    tecnico: string;
    tipoServicio: string;
    valorizado: number;
    pagado: number | null;        // null = por auditar
    diferencia: number | null;
    categoria: CategoriaConciliacion;
    cantidadImagenes: number;
    marcadaApelacion: boolean;
    motivo?: string | null;
    estadoPago: EstadoPago;
    motivoNoPago?: string | null;
}

export interface TotalEstadoPago {
    estadoPago: EstadoPago;
    cantidad: number;
    monto: number;
}

export interface ConciliacionResponse {
    anio: number;
    mes: number;
    totalValorizado: number;
    totalPagado: number;
    diferenciaTotal: number;
    sotEvaluadas: number;
    totalSots: number;
    ultimaAuditoria?: string | null;
    totalesPorEstadoPago: TotalEstadoPago[];
    cuadra: number;
    diferencia: number;
    noPagada: number;
    porAuditar: number;
    filas: FilaConciliacion[];
    totalFilas: number;
    pagina: number;
    canPagina: number;
    totalPaginas: number;
}
