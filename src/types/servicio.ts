export type CategoriaServicio = 'HFC' | 'FTH' | 'MANTTO';
export type SubtipoServicio = 'ZONA_NO_COMPLEJA' | 'ZONA_COMPLEJA' | 'ZONA_PLAYA' | 'CASUARINAS';
export interface Servicio {
    codigo: number;
    nombre: string;
    precio: number;
    categoria: CategoriaServicio;
    subTipoServicio : SubtipoServicio;
    fechaCreacion: string;
}

export interface ListServiciosRequest {
    buscarNombre?: string;
    categoria?: CategoriaServicio;
    pagina?: number;
    subTipoServicio? : SubtipoServicio;
    cantidadPorPagina?: number;
}
