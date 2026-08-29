import { api } from './api';
// Aquí importarías tus interfaces DTO que crearemos luego
// import { LoginRequest, AuthResponse } from '../types/auth.types';

export const AuthService = {
  login: async (credentials: any) => { // Cambiaremos 'any' por tu DTO más adelante
    const response = await api.post('/Auth/login', credentials);
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post('/Auth/register', userData);
    return response.data;
  }
};