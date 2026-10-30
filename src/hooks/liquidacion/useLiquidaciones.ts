import { useState, useCallback, useEffect } from 'react';
import {
    getLiquidaciones,
    postLiquidacion,
    updateLiquidacion,
    deleteLiquidacion,
} from '../../services/liquidacion.service';

import type { 
    ListarRequestLiquidacionesDto,
    ListParamsLiquidacionesDto,
    CrearLiquidacionRequest,
    EditarLiquidacionRequestDto 
} from '../../types/liquidacion.types';

export const useLiquidaciones = (initialParams?: ListParamsLiquidacionesDto) => {
    const [data, setData] = useState<ListarRequestLiquidacionesDto[]>([]);
    const [totalRecords, setTotalRecords] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [params, setParams] = useState<ListParamsLiquidacionesDto>(
        initialParams || { pagina: 1, canPagina:15 }
    );

    const fetchLiquidaciones = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getLiquidaciones(params);
            setData(Array.isArray(result) ? result : []);
            setTotalRecords(Array.isArray(result) ? result.length : 0);
        }catch(err: any){
            const msg = err.response?.data?.error || err.response?.data?.mensaje || "Error al cargar liquidaciones";
            setError(msg);
        }finally{
            setLoading(false);
        }
        
    },[params]);

    useEffect(() =>{
        fetchLiquidaciones();
    }, [fetchLiquidaciones]);
    
    // recargar = false para el guardado masivo: se recarga una sola vez al final.
    // Devuelve el mensaje de error (o null si salió bien) para poder juntar los errores del lote.
    const crearLiquidacion = async (req: CrearLiquidacionRequest, recargar = true): Promise<string | null> => {
        try{
            await postLiquidacion(req);
            if (recargar) await fetchLiquidaciones();
            return null;
        }catch(err: any){
            return err.response?.data?.error || err.response?.data?.mensaje || "Error al crear la liquidación";
        }
    };

    const editarLiquidacion = async (sot: number, req: EditarLiquidacionRequestDto, recargar = true): Promise<string | null> => {
        try{
            await updateLiquidacion(sot, req);
            if (recargar) await fetchLiquidaciones();
            return null;
        }catch(err: any){
            return err.response?.data?.error || err.response?.data?.mensaje || "Error al editar la liquidación";
        }
    }

    const eliminarLiquidacion = async (sot: number) => {
        setLoading(true);
        setError(null);
        try{
            await deleteLiquidacion(sot);
            await fetchLiquidaciones();  
        }catch(err: any){
            const msg = err.response?.data?.error || err.response?.data?.mensaje || "Error al eliminar la liquidación";
            setError(msg);
        }finally{
            setLoading(false);
        }
    }

    return {data, totalRecords, loading, error, setError, params, setParams, fetchLiquidaciones, crearLiquidacion, editarLiquidacion, eliminarLiquidacion};
};