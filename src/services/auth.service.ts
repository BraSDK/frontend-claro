import { api } from '../api/api';
import type { LoginRequest, LoginResponse, PerfilUsuario, CambiarPasswordRequest } from '../types/auth.types';

export const loginService = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const devueloe = await api.post<LoginResponse>('Auth/login', credentials);
    return devueloe.data;
};
export const getPerfil = async (): Promise<PerfilUsuario> => {
    const { data } = await api.get<PerfilUsuario>('Auth/me');
    return data;
};

export const cambiarPassword = async (request: CambiarPasswordRequest): Promise<void> => {
    await api.put('Auth/cambiar-password', request);
};

// Edita mis datos con el endpoint de usuarios (el back valida que sea mi propia cuenta)
const ROL_A_NUMERO: Record<string, number> = { ADMIN: 0, TECNICO: 1, ALMACEN: 2 };

export const actualizarMiPerfil = async (perfil: PerfilUsuario, cambios: { nombreCompleto: string; documentoIdentidad: string; email: string }) => {
    await api.put('User/update', {
        id: perfil.cuentaId,
        email: cambios.email,
        nombreCompleto: cambios.nombreCompleto,
        documentoIdentidad: cambios.documentoIdentidad,
        rol: ROL_A_NUMERO[perfil.rol],   // se manda el mismo rol: un usuario no puede cambiarse el rol
        passwordNew: null,
    });
};
