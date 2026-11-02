export type Rol = "ADMIN"|"TECNICO"|"ALMACEN";

export const PERMISOS = {
    verLiquidacion:     ['ADMIN', 'ALMACEN' ],
    verValorizacion:    ['ADMIN','ALMACEN'],
    verPagosClaro:   ['ADMIN', 'ALMACEN'],
    verReportes:     ['ADMIN', 'ALMACEN'],
    verAuditoria:       ['ADMIN', 'ALMACEN'],
    verConciliacion:    ['ADMIN', 'ALMACEN'],
    gestionarServicios: ['ADMIN', 'ALMACEN'],
    gestionarUsuarios:  ['ADMIN'],
    eliminarOrden:      ['ADMIN'],

} satisfies Record<string,Rol[]>;

// transformamos a llaves

export type Permiso = keyof typeof PERMISOS;

// se veria asi 
/*
 verliquidacion | verConciliacion | ....
*/

export const validarPermiso = (rol: string | undefined, permiso:Permiso) => 
    !!rol && (PERMISOS[permiso] as string[]).includes(rol);



