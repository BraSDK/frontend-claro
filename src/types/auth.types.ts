export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}
export interface PerfilUsuario {
    cuentaId: number;
    usuarioId?: number | null;
    email: string;
    nombreCompleto: string;
    documentoIdentidad: string;
    rol: string;              // ADMIN | TECNICO | ALMACEN
    fechaRegistro: string;
}

export interface CambiarPasswordRequest {
    passwordActual: string;
    passwordNueva: string;
}
