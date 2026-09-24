export type EstadoOrden = 0 | 1 | 2 ;
/*
    0 = Ingresado
    1 = Procesado
    2 = Liquidado
*/


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


export interface OrdenTrabajoList{
    ordenId : number,
    sot : number,
    descripcion : string,
    estado : EstadoOrden
}

export interface OrdenesTrabajoRequest{
    pagina?: number;
    cantidadPorPagina?: number;
    fecha?: Date,
    
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
            detalles? : OrdenDetalleTrabajo[],
            imagenes : ImagenesResponse[]
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
  
    DetalleTrabajoId: number,
    ServicioCodigo : number,
    Cantidad : number,
    PrecioTotal :number,
    OrdenTrabajoId : number
    Tipo:number
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

