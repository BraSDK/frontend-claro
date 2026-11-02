import { api } from '../api/api';
import type {
    AuditarLiquidacionItem,
    AuditarLiquidacionesResponse,
    FilaPagoExcel,
    LiquidacionAuditoriaDto,
    PagedResponse,
    ParamsAuditoria,
    PrevisualizarAuditoriaResponse,
} from '../types/auditoria.types';

// Mismo listado de liquidaciones, pero con la paginación completa (total de registros)
export const getLiquidacionesAuditoria = async (params: ParamsAuditoria) => {
    const { data } = await api.get<PagedResponse<LiquidacionAuditoriaDto>>('/Liquidacion/Listar', { params });
    return data;
};

// Cruza las filas del Excel con las liquidaciones por SOT (no guarda nada)
export const previsualizarPagos = async (filas: FilaPagoExcel[]) => {
    const { data } = await api.post<PrevisualizarAuditoriaResponse>('/Liquidacion/auditoria/previsualizar', { filas });
    return data;
};

// Guarda estado de pago, monto pagado y precio editado de una o varias SOT
export const auditarLiquidaciones = async (items: AuditarLiquidacionItem[]) => {
    const { data } = await api.put<AuditarLiquidacionesResponse>('/Liquidacion/auditoria', { items });
    return data;
};
