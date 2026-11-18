import { api } from '../api/api';
import type {  
    ListParamsLiquidacionesDto,
    ListarRequestLiquidacionesDto,
    CrearLiquidacionRequest,
    EditarLiquidacionRequestDto,
    AdicionalDto,
    GuardarAdicionalDto,
} from '../types/liquidacion.types';

// Devuelve las filas Y el total real (antes solo las filas: el total se tomaba del largo de la página)
export const getLiquidaciones = async ( params?: ListParamsLiquidacionesDto): Promise<{ items: ListarRequestLiquidacionesDto[]; total: number }> => {
    const response = await api.get('/Liquidacion/Listar', {params});
    const items: ListarRequestLiquidacionesDto[] = response.data.listaGenerica ?? response.data.datos ?? response.data ?? [];
    return { items, total: response.data.totalRegistros ?? items.length };
};

export const postLiquidacion = async ( nuevaLiquidacion: CrearLiquidacionRequest): Promise<any> => {
    const response = await api.post('/Liquidacion/crearLiquidacion', nuevaLiquidacion);
    return response.data;
};

export const updateLiquidacion = async ( id: number, datosActualizados: EditarLiquidacionRequestDto): Promise<any> => {
    const response = await api.put(`/Liquidacion/${id}/EditarLiquidacion`, datosActualizados);
    return response.data;
};

export const deleteLiquidacion =async (sot: number): Promise<any> => {
    const response = await api.delete(`/Liquidacion/${sot}/delete`);
    return response.data;
}

// ===== Catálogo de precios de adicionales =====
export const getAdicionales = async (): Promise<AdicionalDto[]> => {
    const response = await api.get<AdicionalDto[]>('/Adicional');
    console.log(response.data);
    return response.data;

};

export const crearAdicional = async (adicional: GuardarAdicionalDto) => {
    await api.post('/Adicional', adicional);
};

export const actualizarAdicional = async (id: number, adicional: GuardarAdicionalDto) => {
    const response = await api.put(`/Adicional/${id}`, adicional);
    console.log(response.data);
};

export const cambiarEstadoImportacion = async (sot: number, aprobar: boolean): Promise<any> => {
    // Enviamos el prametro 'aprobar' por Qery String (como lo definimos en el controlador)
    const response = await api.put(`/Liquidacion/${sot}/estado-importacion?aprobar=${aprobar}`);
    return response.data;
};

export const restaurarLiquidacion = async (sot: number): Promise<any> => {
    const response = await api.put(`/Liquidacion/${sot}/restaurar`);
    return response.data;
}
