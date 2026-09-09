import { useState } from 'react';
import { loginService } from '../services/auth.service';
import type { LoginRequest } from '../types/auth.types';

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [ error, setError] =useState<string | null>(null);

    const login = async (credentials: LoginRequest) => {
        setIsLoading(true);
        setError(null);
        try{
            const data = await loginService(credentials);
            // Guardamos el token en localStoage temporalmente
            localStorage.setItem('jwt_token', data.token);
            return data;
        } catch (err: any ) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };
    return { login, isLoading, error};
};