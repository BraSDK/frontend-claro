// Módulos del sistema: alimentan el menú desplegable del header y su título según la ruta
export interface Modulo {
    nombre: string;
    ruta: string;
    soloGestion?: boolean;   // solo ADMIN y ALMACÉN
    grupo?: 'Administración';
}

export const MODULOS: Modulo[] = [
    { nombre: 'Inicio', ruta: '/dashboard' },
    { nombre: 'Órdenes de trabajo', ruta: '/ordenes' },
    { nombre: 'Valorización almacén', ruta: '/valorizacion', soloGestion: true },
    { nombre: 'Pagos Claro', ruta: '/pagos-claro', soloGestion: true },
    { nombre: 'Conciliación de pagos', ruta: '/conciliacion', soloGestion: true },
    { nombre: 'Liquidacion', ruta: '/liquidacion', soloGestion: true },
    { nombre: 'Reportes', ruta: '/reportes', soloGestion: true },
    { nombre: 'Configuración', ruta: '/configuracion' },
    { nombre: 'Servicios', ruta: '/servicios', soloGestion: true, grupo: 'Administración' },
    { nombre: 'Usuarios', ruta: '/usuarios', soloGestion: true, grupo: 'Administración' },
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
