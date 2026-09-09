import { api } from './api';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export const loginService = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const devueloe = await api.post<LoginResponse>('/Auth/login', credentials);
    return devueloe.data;
};