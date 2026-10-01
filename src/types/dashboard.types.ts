import type { EstadoOrden } from "./Ordenes";

export interface EstadoResumen { estado: EstadoOrden; cantidad: number; monto: number; }
export interface TecnicoResumen { usuarioId: number; nombre: string; cantidad: number; monto: number; }
export interface ServicioResumen { codigo: number; nombre: string; cantidad: number; monto: number; }
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
