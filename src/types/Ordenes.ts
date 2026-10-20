import type { CategoriaServicio } from "./servicio";

export type EstadoOrden = 0 | 1 | 2 ;
/*
    0 = Ingresado
    1 = Procesado
    2 = Liquidado
*/
export const TipoServicio = {
    COSTO : 0,
    ADICIONAL : 1,
    DROP150 : 2,
    DROP200 : 3,
    DROP300 : 4
} as const;
/*
    COSTO = 0,
    DETALLE = 1,
    DROP150 = 2,
    DROP200 = 3,
    DROP300 = 4
*/

//para data extra
export interface DataExtra {
    //data que viene con la lista de trabajo
        totalRegistros : number,
        totalRegistrosPagina : number,
        numeroPagina : number,
        totalPaginasTotales : number
}

//Para creacion de OT
export interface OrdenCreateRequest //para crear  por parte del tecnico
{
    OrdenId? : number,
    Sot : number,
    Descripcion : string,
    UsuarioId? : number,
    Estado: EstadoOrden,
    Imagenes : File[]
}

//Editar orden completa request
export interface EditarOrdenCompletaRequest{
    Sot : number,          
    Descripcion : string,
    Estado :number,     
    DetallesNuevos : OrdenDetalleTrabajo[],
    DetallesEditados : OrdenDetalleTrabajo[],   
    DetallesEliminados : number[],       
    ArchivosEliminados : number[]

}
export interface OrdenTrabajoList{
    ordenId : number,
    sot : number,
    descripcion : string,
    estado : EstadoOrden,
    fecha? : string,
    usuarioId? : number,
    nombreUsuario?:string,
    precioTotal? : number | null,
    montoAPagar? : number,
    auditada? : boolean,
    cantidadImagenes? : number,
    estadoPago? : EstadoPago,
    motivoNoPago? : string | null,
    // montos por tipo de línea (editables desde la tabla)
    costo? : number,
    adicional? : number,
    drop150? : number,
    drop200? : number,
    drop300? : number
}
// Edición desde la tabla de Órdenes: solo el campo que cambió
export interface EdicionRapidaRequest {
    estado?: EstadoOrden,
    descripcion?: string,
    usuarioId?: number,
    tipoMonto?: number,      // TipoDetalle: 0 costo, 1 adicional, 2 drop 150, 3 drop 200, 4 drop 300
    monto?: number           // 0 = quitar esa línea
}


export interface OrdenesTrabajoRequest{
    pagina?: number;
    canPagina?: number;
    // filtros (opcionales)
    buscar?: string;        // SOT o parte de ella
    estado?: EstadoOrden;
    auditada?: boolean;     // true = auditadas, false = sin auditar
    tecnicoId?: number;     // Usuario.Id; para un técnico el back ignora este filtro
    desde?: string;         // yyyy-mm-dd
    hasta?: string;         // yyyy-mm-dd
}

export interface OrdenTrabajoListResponse{
        ListaOrdenes : OrdenTrabajoList[] ,
        TotalRegistros : number,
        TotalRegistrosPagina : number,
        NumeroPagina : number

}

export interface OrdenTrabajoDetalleResponse{
            ordenId :number,
            sot : number,
            descripcion : string,
            usuarioId?:number,
            estado : number,
            precioTotal? :number,
            fecha? : string,
            nombreUsuario? : string,
            // auditoría (el técnico no la recibe)
            descuento? : number,
            sinPago? : boolean,
            observacionAuditoria? : string | null,
            fechaAuditoria? : string | null,
            auditada? : boolean,
            montoAPagar? : number,
            estadoPago? : EstadoPago,
            motivoNoPago? : string | null,
            observacionPago? : string | null,
            detalles? : OrdenDetalleTrabajo[],
            imagenes : ImagenesResponse[]
}

export interface AuditarOrdenRequest {
    descuento: number,
    sinPago: boolean,
    observacion: string,
    estado?: EstadoOrden
}

export interface OrdenDetalleVista{
            OrdenId : number,
            sot : number,
            descripcion : string,
            precioTotal? :number,
            usuarioId?:number,
            detalles? : OrdenDetalleTrabajo[]
}

export interface OrdenTrabajo{
            OrdenId :number,
            Sot : number,
            Descripcion : string,
            Estado : number,
            PrecioTotal :number,
            Imagenes : Imagenes[]
            Detalles : OrdenDetalleTrabajo[]
}



export interface OrdenDetalleTrabajo{
    categoriaServicio? : string,
    detalleId?: number,
    concepto? : string,          // "FTTH01 - 1PLAY INTERNET", "ADICIONAL", "DROP 220"
    precioUnitario? : number,
    servicioId? : number,        // solo para el formulario: el servicio elegido del catálogo
    precioServicio?: number,     // solo para el formulario: precio del servicio elegido
    cantidad : number,
    precioTotal? :number,
    ordenTrabajoId? : number
    tipo?:number

}

export interface OrdenInicialRequest 
{
    OrdenId? : number,
    Sot : number,
    Descripcion : string,
    UsuarioId? : number,
    Estado: EstadoOrden,
    Imagenes : Imagenes[]
}



export interface CambiosTecnico { //para editar del tecenico
  OrdenId?: number;
  Sot?: number;
  Descripcion?: string;
  UsuarioId?: number;
  ArchivosEliminados: number[];
  ArchivosNuevos: File[];
}

export interface ImagenesResponse
{
    archivoId : number,
    nombreArchivo: string,
    src :string,
    url? : string
}

export interface Imagenes
{
    archivoId? : number,
    nombreArchivo: string,
    src : File,
    url : string
}



// Resultado de la carga masiva de SOTs desde Excel
export interface ErrorFilaImportacion {
    fila: number,
    sot?: number,
    mensaje: string
}

export interface ImportarExcelResponse {
    ordenesCreadas: number,
    ordenesActualizadas: number,
    serviciosCreados: string[],
    errores: ErrorFilaImportacion[]
}

// Auditoría masiva sin descuento: ordenIds = seleccionadas; sin ordenIds = todas las del filtro
export interface AuditarMasivoRequest {
    ordenIds?: number[],
    filtros?: OrdenesTrabajoRequest,
    confirmar: boolean
}

export interface AuditarMasivoResponse {
    auditadas: number,      // auditadas (o que se auditarían si confirmar = false)
    yaAuditadas: number,
    sinImagen: number
}

// Estado de pago de la SOT (coincide con el enum EstadoPago del back)
export const EstadoPago = {
    Pendiente: 0,
    SiPago: 1,
    NoPago: 2,
} as const;
export type EstadoPago = typeof EstadoPago[keyof typeof EstadoPago];

export const MOTIVOS_NO_PAGO = [
    'Sin fotos',
    'SOT incorrecta en pizarra',
    'Foto de otro dispositivo',
    'Niveles fuera de rango',
    'Cálculo negativo (dB)',
    'Código de solución erróneo',
    'No liquidado en SGA',
    'Volverá a campo',
    'Otro',
] as const;

export interface AuditoriaPagoRequest {
    estadoPago: EstadoPago,
    motivoNoPago?: string | null,
    observacionPago?: string | null
}

export interface AuditoriaPagoResponse {
    ordenId: number,
    estadoPago: EstadoPago,
    motivoNoPago?: string | null,
    observacionPago?: string | null,
    fechaAuditoria?: string | null,
    montoAPagar: number
}
