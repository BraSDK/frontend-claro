import { api } from '../api/api';
import type { DashboardResumen, TecnicoOpcion } from '../types/dashboard.types';

// Resumen del mes; sin parámetros el back usa el mes actual
export const getResumenDashboard = async (anio?: number, mes?: number): Promise<DashboardResumen> => {
    const { data } = await api.get<DashboardResumen>('Dashboard/resumen', { params: { anio, mes } });
    return data;
};

export const getTecnicos = async (): Promise<TecnicoOpcion[]> => {
    const { data } = await api.get<TecnicoOpcion[]>('Dashboard/tecnicos');
    return data;
};
