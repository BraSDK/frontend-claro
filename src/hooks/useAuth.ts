import { useState } from 'react';
import { loginService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import type { LoginRequest } from '../types/auth.types';
interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}
function obtenerUsuarioDelToken(): { usuarioId: number; rol: string } | null {
  const token = localStorage.getItem('jwt_token');
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return { usuarioId: Number(decoded.sub), rol: decoded.role };
  } catch {
    return null;
  }
}

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

    const usuario = obtenerUsuarioDelToken();
    
    return { login, isLoading, error, 
            UsuarioId:usuario?.usuarioId, 
            rol:usuario?.rol,
            esTecnico: usuario?.rol === 'TECNICO',
            esGestionCompleta: usuario?.rol === 'ADMIN' || usuario?.rol === 'ALMACEN'
    };
};