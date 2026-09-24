  export const Rol = {
    ADMIN: 'ADMIN',
    TECNICO: 'TECNICO',
    ALMACEN: 'ALMACEN'
  } as const;

  // 2. Tipo derivado (equivale exactamente a: 'ADMIN' | 'TECNICO' | 'ALMACEN')
  export type Rol = (typeof Rol)[keyof typeof Rol];

  export interface Usuario {
  id: number;
  email: string;
  nombreCompleto: string;
  documentoIdentidad: string;
  rol: Rol; // o string, dependiendo de cómo serialice tu backend
  fechaRegistro: string;
  }

  export interface ListUsuariosRequest {
    buscarNombreCompleto?: string;
    rol?: Rol;
    pagina?: number;
    cantidadPorPagina?: number;
  }
  
  export interface RegisterRequestDto {
    email: string;
    password?: string;
    nombreCompleto: string;
    documentoIdentidad: string;
    rol: Rol;
  }
  
  export interface EditRequestDto {
    id: number;
    nombreCompleto?: string;
    documentoIdentidad?: string;
    email?: string;
    rol?: Rol;
  }

  export interface UsuarioFilterState {
    nombreCompleto: string;
    documentoIdentidad: string;
    rol: Rol | '';
  }