// Espejo de PagedResponse<T> del back (DTOs/Wrapper/PagedResponse.cs)
export interface PagedResponse<T> {
    listaGenerica: T[];
    totalRegistros: number;
    numeroPagina: number;
    totalRegistrosPagina: number;   // registros que trae ESTA página
    tamanoPagina: number;           // registros por página pedidos
    totalPaginasTotales: number;    // calculado por el back
}
