import { api } from '../api/api';
import type { ConciliacionRequest, ConciliacionResponse } from '../types/conciliacion.types';

export const getConciliacion = async (params: ConciliacionRequest): Promise<ConciliacionResponse> => {
    const { data } = await api.get<ConciliacionResponse>('Conciliacion', { params });
    return data;
};

export const marcarApelacion = async (ordenIds: number[], marcar: boolean): Promise<number> => {
    const { data } = await api.put<{ actualizadas: number }>('Conciliacion/apelacion', { ordenIds, marcar });
    return data.actualizadas;
};

// Descarga el Excel de diferencias del periodo
export const exportarDiferencias = async (anio: number, mes: number) => {
    const { data } = await api.get<Blob>('Conciliacion/exportar', { params: { anio, mes }, responseType: 'blob' });
    const url = URL.createObjectURL(data);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `diferencias-conciliacion-${anio}-${String(mes).padStart(2, '0')}.xlsx`;
    enlace.click();
    URL.revokeObjectURL(url);
};
