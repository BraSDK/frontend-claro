import { api } from '../api/api';
import type {  
    ListParamsLiquidacionesDto,
    ListarRequestLiquidacionesDto,
    CrearLiquidacionRequest,
    EditarLiquidacionRequestDto,
} from '../types/liquidacion.types';

export const getLiquidaciones = async ( params?: ListParamsLiquidacionesDto): Promise<ListarRequestLiquidacionesDto[]> => {
    const response = await api.get('/Liquidacion/Listar', {params});
    return response.data.datos ?? response.data
};

export const postLiquidacion = async ( nuevaLiquidacion: CrearLiquidacionRequest): Promise<any> => {
    const response = await api.post('/Liquidacion/crearLiquidacion', nuevaLiquidacion);
    return response.data;
};

export const updateLiquidacion = async ( id: number, datosActualizados: EditarLiquidacionRequestDto): Promise<any> => {
    const response = await api.put(`/Liquidacion/${id}/EditarLiquidacion`, datosActualizados);
    return response.data;
};

export const deleteLiquidacion =async (id: number): Promise<any> => {
    const response = await api.delete(`/Liquidacion/${id}/delete`);
    return response.data;
}