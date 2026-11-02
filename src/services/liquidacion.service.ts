import { api } from '../api/api';
import type {  
    ListParamsLiquidacionesDto,
    ListarRequestLiquidacionesDto,
    CrearLiquidacionRequest,
    EditarLiquidacionRequestDto,
    AdicionalDto,
    GuardarAdicionalDto,
} from '../types/liquidacion.types';

export const getLiquidaciones = async ( params?: ListParamsLiquidacionesDto): Promise<ListarRequestLiquidacionesDto[]> => {
    const response = await api.get('/Liquidacion/Listar', {params});
    return response.data.listaGenerica ?? response.data.datos ?? response.data;
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
    return response.data;
};

export const crearAdicional = async (adicional: GuardarAdicionalDto) => {
    await api.post('/Adicional', adicional);
};

export const actualizarAdicional = async (id: number, adicional: GuardarAdicionalDto) => {
    await api.put(`/Adicional/${id}`, adicional);
};
