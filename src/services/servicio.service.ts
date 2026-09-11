import { api } from './api';
import type { Servicio, ListServiciosRequest } from '../types/servicio';

export const getServicios = async(params?: ListServiciosRequest): Promise<Servicio[]> => {
    // Convierte automaticamente este objeto en parametros de consulta
    const response =await api.get('/Service/list', { params });
    return response.data.datos;
};

export const postServicios = async(nuevoServicio: Partial<Servicio>): Promise<any> => {
    const response = await api.post('/Service/create', nuevoServicio);
}

export const updateServicios = async(codigo: number, datosActualizados: Partial<Servicio>): Promise<Servicio> => {
    const response = await api.put(`/Service/update/${codigo}`, datosActualizados);
    return response.data;
};
    
