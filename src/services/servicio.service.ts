import { api } from '../api/api';
import type { Servicio, ListServiciosRequest } from '../types/servicio';

export const getServicios = async(params?: ListServiciosRequest): Promise<Servicio[]> => {
    // Convierte automaticamente este objeto en parametros de consulta
    const response =await api.get('/Service/list', { params });
    return response.data.datos;
};

export const postServicios = async(nuevoServicio: Partial<Servicio>): Promise<any> => {
    const response = await api.post('/Service/create', nuevoServicio);
    return response.data;
};

export const updateServicios = async(codigo: number, datosActualizados: Partial<Servicio>): Promise<Servicio> => {
    const payload = { ...datosActualizados, codigo: codigo };
    const response = await api.put('/Service/update', payload); // <-- URL idéntica a Swagger
    return response.data;
};

export const deleteServicios = async(codigo: number): Promise <Servicio> => {
    const response = await api.delete(`/Service/${codigo}`);
    return response.data;
};

