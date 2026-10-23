import { api } from '../../api/api';
import type { PagedResponse } from '../../types/paginacion';
import type { ArchivoOrden, CrearOrdenRequest, EdicionRapidaRequest, ListarOrdenesParams, OrdenTrabajo } from '../../types/Ordenes';

// Un método por endpoint de OrdenTrabajoController (api/OrdenTrabajo). Entre paréntesis, los roles que acepta el back.

// GET List (todos; un técnico solo recibe las suyas)
export const listarOrdenes = async (params: ListarOrdenesParams = {}): Promise<PagedResponse<OrdenTrabajo>> => {
    const { data } = await api.get<PagedResponse<OrdenTrabajo>>('OrdenTrabajo/List', { params });
    return data;
};

// El back no tiene "obtener por id": se busca por SOT (es única) en el listado
export const obtenerOrdenPorSot = async (sot: number): Promise<OrdenTrabajo | null> => {
    const { listaGenerica } = await listarOrdenes({ buscar: String(sot), canPagina: 50 });
    return listaGenerica.find((o) => o.sot === sot) ?? null;
};

// POST (ADMIN, TECNICO) multipart: campos de la orden + "imagenes"
export const crearOrden = async (orden: CrearOrdenRequest): Promise<OrdenTrabajo> => {
    const formData = new FormData();
    formData.append('Sot', String(orden.sot));
    formData.append('DocTecnico', orden.docTecnico);
    formData.append('TrabajoRealizado', orden.trabajoRealizado);
    formData.append('EstadoCampo', String(orden.estadoCampo));
    formData.append('UsuarioId', String(orden.usuarioId));
    orden.imagenes.forEach((img) => formData.append('imagenes', img));
    const { data } = await api.post<OrdenTrabajo>('OrdenTrabajo', formData);
    return data;
};

// PATCH {id}/edicion-rapida (ADMIN, ALMACEN): devuelve la orden actualizada
export const edicionRapida = async (ordenId: number, cambio: EdicionRapidaRequest): Promise<OrdenTrabajo> => {
    const { data } = await api.patch<OrdenTrabajo>(`OrdenTrabajo/${ordenId}/edicion-rapida`, cambio);
    return data;
};

// DELETE {id}/delete (cualquier usuario autenticado): borra la orden y sus imágenes
export const eliminarOrden = async (ordenId: number): Promise<void> => {
    await api.delete(`OrdenTrabajo/${ordenId}/delete`);
};

// POST {id}/archivos (ADMIN, TECNICO): devuelve todas las imágenes de la orden
export const agregarArchivos = async (ordenId: number, archivos: File[]): Promise<ArchivoOrden[]> => {
    const formData = new FormData();
    archivos.forEach((a) => formData.append('archivos', a));
    const { data } = await api.post<ArchivoOrden[]>(`OrdenTrabajo/${ordenId}/archivos`, formData);
    return data;
};

// DELETE {id}/archivos/{archivoId} (ADMIN, TECNICO)
export const eliminarArchivo = async (ordenId: number, archivoId: number): Promise<void> => {
    await api.delete(`OrdenTrabajo/${ordenId}/archivos/${archivoId}`);
};

// URL pública de una imagen (el back sirve los archivos desde la raíz del servidor)
export const urlArchivo = (archivo: ArchivoOrden) => archivo.url || `${import.meta.env.VITE_API_URL2}${archivo.src}`;

// El back responde { error } en 400/404 y { mensaje } en 500
export const mensajeError = (err: unknown, porDefecto: string): string => {
    const e = err as { response?: { status?: number; data?: { error?: string; mensaje?: string } } };
    if (!e?.response) return 'No hay conexión con el servidor.';
    if (e.response.status === 403) return 'No tienes permisos para esta acción.';
    return e.response.data?.error ?? e.response.data?.mensaje ?? porDefecto;
};
