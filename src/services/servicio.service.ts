import { api } from './api';
import type { Servicio, ListServiciosRequest } from '../types/servicio';

export const getServicios = async(params?: ListServiciosRequest): Promise<Servicio[]> => {
    // Convierte automaticamente este objeto en parametros de consulta
    const response =await api.get('/Service/list', { params });
    return response.data.datos;
}

