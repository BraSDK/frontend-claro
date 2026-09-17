import { api } from './api';
import type { 
  Usuario, 
  ListUsuariosRequest, 
  RegisterRequestDto, 
  EditRequestDto 
} from '../types/usuario.types';

export const getUsuarios = async (params?: ListUsuariosRequest): Promise<Usuario[]> => {
  // Axios convierte automáticamente el objeto "params" en query strings
  // Ejemplo: /User/list?pagina=1&cantidadPorPagina=10&buscarNombreCompleto=Juan
  const response = await api.get('/User/list', { params });
  
  // Dependiendo de si tu backend devuelve un paginado con metadatos o solo la lista
  // Ajusta esto a response.data.items o response.data.datos si es necesario
  return response.data.datos ?? []; 
};

export const createUsuario = async (nuevoUsuario: RegisterRequestDto): Promise<any> => {
  const response = await api.post('/Auth/register', nuevoUsuario);
  return response.data;
};

export const updateUsuario = async (datosActualizados: EditRequestDto): Promise<any> => {
  const response = await api.put('/User/update', datosActualizados);
  return response.data;
};

export const deleteUsuario = async (id: number): Promise<any> => {
  const response = await api.delete(`/User/${id}`);
  return response.data;
};