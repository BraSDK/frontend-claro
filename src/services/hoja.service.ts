import { api } from '../api/api';
import type { Hoja } from '../types/hoja.types';

// GET api/Hoja → la más reciente primero (la del mes actual siempre existe)
export const listarHojas = async (): Promise<Hoja[]> => {
    const response = await api.get<Hoja[]>('/Hoja');
    return response.data;
};

// PUT api/Hoja/{id}/nombre → devuelve la hoja ya renombrada
export const renombrarHoja = async (hojaId: number, nombre: string): Promise<Hoja> => {
    const response = await api.put<Hoja>(`/Hoja/${hojaId}/nombre`, { nombre });
    return response.data;
};
