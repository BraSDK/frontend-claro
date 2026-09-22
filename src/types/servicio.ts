export type CategoriaServicio = 'HFC' | 'FTH' | 'MANTTO';

export interface Servicio {
    codigo: number;
    nombre: string;
    precio: number;
    categoria: CategoriaServicio;
    fechaCreacion: string;
}

export interface ListServiciosRequest {
    buscarNombre?: string;
    categoria?: CategoriaServicio;
    pagina?: number;
    cantidadPorPagina?: number;
}
