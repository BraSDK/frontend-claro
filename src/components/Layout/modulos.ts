import type {Permiso} from "../../utils/permisos";

// Módulos del sistema: alimentan el menú desplegable del header y su título según la ruta
export interface Modulo {
    nombre: string;
    ruta: string;
    permiso?: Permiso;  
    grupo?: 'Administración';
    pantallaCompleta?: boolean;   // sin márgenes del <main>: la pantalla va pegada al header y a los bordes (vista tipo hoja)
}

export const MODULOS: Modulo[] = [
    { nombre: 'Inicio', ruta: '/dashboard' },
    { nombre: 'Órdenes de trabajo', ruta: '/ordenes' },
    { nombre: 'Valorización almacén', ruta: '/valorizacion',permiso: 'verValorizacion'},
    { nombre: 'Pagos Claro', ruta: '/pagos-claro', permiso:'verPagosClaro'},
    { nombre: 'Conciliación de pagos', ruta: '/conciliacion',permiso:'verConciliacion' },
    { nombre: 'Liquidacion', ruta: '/liquidacion',permiso:'verLiquidacion', pantallaCompleta: true },
    { nombre: 'Auditoría de liquidaciones', ruta: '/auditoria', permiso: 'verAuditoria' },
    { nombre: 'Reportes', ruta: '/reportes' , permiso:'verReportes'},
    { nombre: 'Configuración', ruta: '/configuracion' },
    { nombre: 'Servicios', ruta: '/servicios', permiso: 'gestionarServicios', grupo: 'Administración' },
    { nombre: 'Usuarios', ruta: '/usuarios', permiso: 'gestionarUsuarios', grupo: 'Administración' },
];

// Pantallas que no son un módulo del menú pero tienen su propio título
const SUBPANTALLAS: { patron: RegExp; titulo: string }[] = [
    { patron: /^\/ordenes\/nueva/, titulo: 'Nueva orden de trabajo' },
    { patron: /^\/ordenes\/\d+\/editar/, titulo: 'Editar orden de trabajo' },
];

export const tituloDeRuta = (ruta: string): string =>
    SUBPANTALLAS.find((s) => s.patron.test(ruta))?.titulo
    ?? MODULOS.find((m) => ruta === m.ruta || ruta.startsWith(`${m.ruta}/`))?.nombre
    ?? 'SistemaClaro';

export const moduloActivo = (ruta: string) =>
    MODULOS.find((m) => ruta === m.ruta || ruta.startsWith(`${m.ruta}/`));
