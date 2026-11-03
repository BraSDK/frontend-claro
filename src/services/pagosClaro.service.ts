import { api } from '../api/api';
import type {
    CrearPagoClaro, GuardarMulta, MultaClaro, PagoClaroDetalle, PagoClaroResumen, RangoFechas, SotPago,
} from '../types/pagosClaro.types';

// ===== Pagos (lotes) =====

export const getSotsPendientesPago = async (rango?: RangoFechas): Promise<SotPago[]> =>
    (await api.get<SotPago[]>('/PagoClaro/sots-pendientes', { params: rango })).data;

export const getPagosClaro = async (rango?: RangoFechas): Promise<PagoClaroResumen[]> =>
    (await api.get<PagoClaroResumen[]>('/PagoClaro', { params: rango })).data;

export const getPagoClaro = async (id: number): Promise<PagoClaroDetalle> =>
    (await api.get<PagoClaroDetalle>(`/PagoClaro/${id}`)).data;

export const crearPagoClaro = async (pago: CrearPagoClaro): Promise<number> =>
    (await api.post<{ pagoClaroId: number }>('/PagoClaro', pago)).data.pagoClaroId;

export const eliminarPagoClaro = async (id: number) => {
    await api.delete(`/PagoClaro/${id}`);
};

// ===== Multas generales =====

export const getMultasClaro = async (params?: RangoFechas & { soloPendientes?: boolean }): Promise<MultaClaro[]> =>
    (await api.get<MultaClaro[]>('/PagoClaro/multas', { params })).data;

export const crearMultaClaro = async (multa: GuardarMulta) => {
    await api.post('/PagoClaro/multas', multa);
};

export const editarMultaClaro = async (id: number, multa: GuardarMulta) => {
    await api.put(`/PagoClaro/multas/${id}`, multa);
};

export const eliminarMultaClaro = async (id: number) => {
    await api.delete(`/PagoClaro/multas/${id}`);
};

// mensaje del back ({ error }) o uno genérico
export const mensajeError = (e: any, porDefecto: string): string =>
    e?.response?.data?.error ?? (e?.response ? porDefecto : 'No hay conexión con el servidor');
