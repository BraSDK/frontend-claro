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
            setData(result);
            // Si tu backend no devuelve el total real en la respuesta, usamos la longitud del array
            // Lo ideal es que el GET devuelva { datos: [...], totalRegistros: 100 }
            setTotalRecords(result.length);
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
    
    const crearLiquidacion = async (req: CrearLiquidacionRequest) => {
        setLoading(true);
        setError(null);
        try{
            await postLiquidacion(req);
            await fetchLiquidaciones();
        }catch(err: any){
            const msg = err.response?.data?.error || err.respone?.data?.mesanje || "Error al crear la liquidación";
            setError(msg);
        }finally{
            setLoading(false);
        }
    };

    const editarLiquidacion = async (id: number, req: EditarLiquidacionRequestDto) => {
        setLoading(true);
        setError(null);
        try{
            await updateLiquidacion(id, req);
            await fetchLiquidaciones();
        }catch(err: any){
            const msg = err.response?.data?.error || err.response?.data?.mensaje || "Error al editar la liquidación";
            setError(msg);
        }finally{
            setLoading(false);
        }
    }

    const eliminarLiquidacion = async (id: number) => {
        setLoading(true);
        setError(null);
        try{
            await deleteLiquidacion(id);
            await fetchLiquidaciones();  
        }catch(err: any){
            const msg = err.response?.data?.error || err.response?.data?.mensaje || "Error al eliminar la liquidación";
            setError(msg);
        }finally{
            setLoading(false);
        }
    }

    return {data, totalRecords, loading, error, params, setParams, fetchLiquidaciones, crearLiquidacion, editarLiquidacion, eliminarLiquidacion};
};