import { api } from '../../api/api';
import type { OrdenesTrabajoRequest, OrdenTrabajoList, OrdenTrabajoDetalleResponse,OrdenInicialRequest,CambiosTecnico } from '../../types/Ordenes';


export const getOrdenes = async (params?: OrdenesTrabajoRequest): Promise<OrdenTrabajoList[]> => {
    const response = await api.get("/OrdenTrabajo/List/", { params });
    console.log(response.data.listaOrdenes[0]);
    return response.data.listaOrdenes;
};

export const getOrdenById = async (id: number): Promise<OrdenTrabajoDetalleResponse> => {

    const data = await api.get<OrdenTrabajoDetalleResponse>(`/OrdenTrabajo/${id}`);
    console.log(data.data);
    return data.data;
};

export const getOrdenBySot = async (sot: number): Promise<OrdenTrabajoDetalleResponse> => {
    const response = await api.get<OrdenTrabajoDetalleResponse>(`/Ordenes/sot/${sot}`);
    return response.data;
};

export const crearOrdenTrabajo = async (ordenTrabajo : OrdenInicialRequest ): Promise<OrdenTrabajoDetalleResponse> => {
    const formData = new FormData();
    formData.append("Sot", ordenTrabajo.Sot.toString());
    formData.append("Descripcion", ordenTrabajo.Descripcion.toString());
    formData.append("UsuarioId", String(ordenTrabajo.UsuarioId ?? 0));
    formData.append("Estado",ordenTrabajo.Estado.toString());
    ordenTrabajo.Imagenes.forEach((img, index) => {
        formData.append(`Imagenes[${index}].Nombre`, img.nombreArchivo);
        formData.append(`Imagenes[${index}].Archivo`, img.src);
    });

    const response = await api.post<OrdenTrabajoDetalleResponse>('', formData);
    return response.data;
}

export const editarByTecnico = async (id: number,ordenEdit : CambiosTecnico):Promise<string> => {
    const formData = new FormData();
    if (ordenEdit.Sot !== undefined)formData.append("Sot",String(ordenEdit.Sot));;
    
    if (ordenEdit.Descripcion !== undefined)formData.append("Descripcion",ordenEdit.Descripcion);
    formData.append("UsuarioId", String(ordenEdit.UsuarioId));
    ordenEdit.ArchivosEliminados.forEach((archivoId) => {
        formData.append("ArchivosEliminados", String(archivoId));
    });
    ordenEdit.ArchivosNuevos.forEach((archivo) => {
        formData.append("ArchivosNuevos", archivo); // debe coincidir con el nombre del parámetro en el controller
    });

    for (let [clave, valor] of formData.entries()) {
    console.log(`${clave}:`, valor);
    }
    const response = await api.put<OrdenTrabajoDetalleResponse>(`OrdenTrabajo/${id}/tecnico`, formData);
    return "response.data";
}
