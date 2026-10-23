// Estado de la SOT en este sistema (enum Estados del back: 0 INGRESADA, 1 LIQUIDADO, 2 VALIDADO)
export type EstadoOrden = 0 | 1 | 2;

export interface EstadoResumen { estado: EstadoOrden; cantidad: number; monto: number; }
export interface TecnicoResumen { usuarioId: number; nombre: string; cantidad: number; monto: number; }
export interface ServicioResumen { nombre: string; cantidad: number; monto: number; }
export interface TipoDetalleResumen { tipo: number; cantidad: number; monto: number; }

export interface UltimaSot {
    ordenId: number;
    sot: number;
    fecha: string;
    nombreUsuario: string;
    estado: EstadoOrden;
    precioTotal?: number | null;
}

export interface DashboardResumen {
    anio: number;
    mes: number;
    totalSots: number;
    montoTotal: number;
    montoAPagar: number;
    sotsAuditadas: number;
    sotsSinImagen: number;
    totalSotsMesAnterior: number;
    montoTotalMesAnterior: number;
    porEstado: EstadoResumen[];
    porTecnico: TecnicoResumen[];
    porServicio: ServicioResumen[];
    porTipoDetalle: TipoDetalleResumen[];
    ultimasSots: UltimaSot[];
}

export interface TecnicoOpcion { usuarioId: number; nombre: string; }
