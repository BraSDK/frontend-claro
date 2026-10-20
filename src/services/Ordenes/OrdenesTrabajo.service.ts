import { api } from '../../api/api';
import type { OrdenesTrabajoRequest, OrdenTrabajoList, OrdenTrabajoDetalleResponse,EditarOrdenCompletaRequest,CambiosTecnico, OrdenCreateRequest, OrdenDetalleTrabajo, ImportarExcelResponse, AuditarOrdenRequest, AuditarMasivoRequest, AuditarMasivoResponse, EdicionRapidaRequest, AuditoriaPagoRequest, AuditoriaPagoResponse } from '../../types/Ordenes';

interface DataTraida{
    listaOrdenes : OrdenTrabajoList[],
    totalRegistros : number,
    totalRegistrosPagina : number,
    numeroPagina : number,
    totalPaginasTotales : number
}

export const getOrdenes = async (params?: OrdenesTrabajoRequest): Promise<DataTraida> => {
    const response = await api.get("/OrdenTrabajo/List/", { params });
    return {
                listaOrdenes : response.data.listaOrdenes,
                totalRegistros : response.data.totalRegistros,
                totalRegistrosPagina : response.data.totalRegistrosPagina,
                numeroPagina : response.data.numeroPagina,
                totalPaginasTotales : response.data.totalPaginasTotales
    };
};

export const getOrdenById = async (id: number): Promise<OrdenTrabajoDetalleResponse> => {

    const data = await api.get<OrdenTrabajoDetalleResponse>(`/OrdenTrabajo/${id}`);

    return data.data;
};

export const getOrdenBySot = async (sot: number): Promise<OrdenTrabajoDetalleResponse> => {
    const response = await api.get<OrdenTrabajoDetalleResponse>(`/Ordenes/sot/${sot}`);
    return response.data;
};

export const crearOrdenTrabajo = async (ordenTrabajo : OrdenCreateRequest ): Promise<OrdenTrabajoDetalleResponse> => {
    const formData = new FormData();
    formData.append("Sot", ordenTrabajo.Sot.toString());
    formData.append("Descripcion", ordenTrabajo.Descripcion.toString());
    formData.append("UsuarioId", String(ordenTrabajo.UsuarioId ?? 0));
    formData.append("Estado",ordenTrabajo.Estado.toString());
    ordenTrabajo.Imagenes.forEach((img) => {
        formData.append("Imagenes", img);
    });

    const response = await api.post<OrdenTrabajoDetalleResponse>('OrdenTrabajo', formData);
    return response.data;
};

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
    return "response.data";;
};
export const eliminarOrden = async(id:number) => {
    const response = await api.delete(`OrdenTrabajo/${id}/delete`);
    return response.status;
};

export const editaOrdenCompleta = async(ordenId:number,ordenTrabajo:EditarOrdenCompletaRequest) => {
    const formData = new FormData();
    if (ordenTrabajo.Sot !== undefined)formData.append("Sot",String(ordenTrabajo.Sot));
    if (ordenTrabajo.Descripcion !== undefined) formData.append("Descripcion",String(ordenTrabajo.Descripcion));
    formData.append("Estado",String(ordenTrabajo.Estado));
    ordenTrabajo.DetallesEliminados.forEach(
        id => {formData.append("DetallesEliminados", String(id))}
    );
    ordenTrabajo.DetallesEditados.forEach(
        (detalle, i) => { 
            formData.append(`DetallesEditados[${i}].DetalleId`,String(detalle.detalleId));
            formData.append(`DetallesEditados[${i}].Concepto`, detalle.concepto ?? "");
            formData.append(`DetallesEditados[${i}].PrecioUnitario`, String(detalle.precioUnitario ?? 0));
            formData.append(`DetallesEditados[${i}].Cantidad`, String(detalle.cantidad));
            formData.append(`DetallesEditados[${i}].Tipo`, String(detalle.tipo));
        }
    );
    ordenTrabajo.DetallesNuevos.forEach(
        (detalle, i) => { 
            formData.append(`DetallesNuevos[${i}].Concepto`, detalle.concepto ?? "");
            formData.append(`DetallesNuevos[${i}].PrecioUnitario`, String(detalle.precioUnitario ?? 0));
            formData.append(`DetallesNuevos[${i}].cantidad`, String(detalle.cantidad));
            formData.append(`DetallesNuevos[${i}].Tipo`, String(detalle.tipo));
        }
    );
    ordenTrabajo.ArchivosEliminados.forEach(
        (i)=> {
            formData.append("ArchivosEliminados",String(i));
        }
    );
    for (let [clave, valor] of formData.entries()) {
    console.log(`${clave}:`, valor);
    }
    const response = await api.put<EditarOrdenCompletaRequest>(`OrdenTrabajo/${ordenId}/EditarOrdenCompleta`,formData);
    console.log("enviado")
    console.log(response.status)
    return response.status;
}

// Edita los detalles existentes de una orden.
// OJO: el back ELIMINA los detalles de la orden que no vengan en esta lista.
export const editarDetallesOrden = async (ordenId: number, detalles: OrdenDetalleTrabajo[]) => {
    const body = detalles.map((d) => ({
        DetalleId: d.detalleId,
        Concepto: d.concepto,
        PrecioUnitario: d.precioUnitario,
        Cantidad: d.cantidad,
        Tipo: d.tipo,
    }));
    const response = await api.put(`OrdenTrabajo/${ordenId}/detalles-edit`, body);
    return response.status;
};

// Agrega un detalle nuevo a la orden (el back calcula el total = precio unitario × cantidad).
export const agregarDetalleOrden = async (ordenId: number, detalle: OrdenDetalleTrabajo) => {
    const response = await api.post(`OrdenTrabajo/${ordenId}/detalles`, {
        Concepto: detalle.concepto,
        PrecioUnitario: detalle.precioUnitario,
        Cantidad: detalle.cantidad,
        Tipo: detalle.tipo,
    });
    return response.data;
};

// Sube el Excel procesado; el back lo lee (no lo guarda) y crea las SOT con sus detalles.
export const importarExcelOrdenes = async (archivo: File): Promise<ImportarExcelResponse> => {
    const formData = new FormData();
    formData.append("archivo", archivo);
    const response = await api.post<ImportarExcelResponse>("OrdenTrabajo/importar-excel", formData);
    return response.data;
};

// Auditoría de la SOT: descuento o multa con su observación
export const auditarOrden = async (ordenId: number, request: AuditarOrdenRequest): Promise<OrdenTrabajoDetalleResponse> => {
    const { data } = await api.put<OrdenTrabajoDetalleResponse>(`OrdenTrabajo/${ordenId}/auditar`, request);
    return data;
};

// Audita sin descuento las SOT pendientes; con confirmar = false solo devuelve el conteo
export const auditarMasivo = async (request: AuditarMasivoRequest): Promise<AuditarMasivoResponse> => {
    const { data } = await api.put<AuditarMasivoResponse>('OrdenTrabajo/auditar-masivo', request);
    return data;
};

// Auditoría de almacén: Sí pago / No pago (No pago exige motivo)
export const auditarPago = async (ordenId: number, request: AuditoriaPagoRequest): Promise<AuditoriaPagoResponse> => {
    const { data } = await api.patch<AuditoriaPagoResponse>(`OrdenTrabajo/${ordenId}/auditoria-pago`, request);
    return data;
};

// Edita un campo de la SOT desde la tabla y devuelve la fila actualizada
export const edicionRapida = async (ordenId: number, cambio: EdicionRapidaRequest): Promise<OrdenTrabajoList> => {
    const { data } = await api.patch<OrdenTrabajoList>(`OrdenTrabajo/${ordenId}/edicion-rapida`, cambio);
    return data;
};
