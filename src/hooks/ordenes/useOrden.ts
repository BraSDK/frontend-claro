import { useState, useEffect,useCallback} from 'react';
import {  getOrdenById,getOrdenBySot,getOrdenes,crearOrdenTrabajo, editarByTecnico } from '../../services/Ordenes/OrdenesTrabajo.service';
import type { OrdenInicialRequest, OrdenTrabajo , OrdenTrabajoList, OrdenesTrabajoRequest,OrdenTrabajoDetalleResponse, CambiosTecnico  } from '../../types/Ordenes';
import { useAuth } from '../useAuth';
export function useOrdenTrabajo (params : OrdenesTrabajoRequest = {}){
    const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenTrabajoDetalleResponse| null>(null);
    const [OrdenesT,setOrdenesT] = useState<OrdenTrabajoList[]>([]);
    const [isLoading,setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const TraerOrdenes = useCallback(async () => {
        try {
            setIsLoading(true);
            const ordenTrabajolist = await getOrdenes(params);
            setOrdenesT(ordenTrabajolist);
        } catch (err: any) {
            setError(err.response?.data?.message ?? "Error al cargar órdenes");
        } finally {
            setIsLoading(false);
        }
    }, [JSON.stringify(params)]);

    useEffect( ()=>{
        TraerOrdenes();
    },[TraerOrdenes])

    const TraerPorId = async (id:number) => {

        try{
            setIsLoading(true);
            const ordenTrabajo = await getOrdenById(id);
            console.log(ordenTrabajo.ordenId);
            setOrdenSeleccionada(ordenTrabajo);
        }catch (err : any){
            setError(err);
        }finally{
            setIsLoading(false);
        }
    }
    const CrearOrden = async (orden : OrdenInicialRequest) => {
        try{
            setIsLoading(true);
            const ordenConfirm = await crearOrdenTrabajo(orden);
            await TraerOrdenes(); 
            return ordenConfirm;
        }catch(err : any){
            setError(err.response?.data?.message ?? "Error al crear la orden");
            throw err;

        }finally{
            setIsLoading(false);
        }
    }

    const EditarOrden = async (id : number,orden : CambiosTecnico) => {
        try{
            setIsLoading(true);
            await editarByTecnico(id,orden);
        }catch(err : any){
            setError(err.response?.data?.message ?? "Error al crear la orden");
            throw err;
        }finally{
            setIsLoading(false);
        }
        
    }

    const EliminarOrden = async (id:number) => {

        try{

        }catch(err : any){

        }finally{

        }

    }

    return {OrdenesT, isLoading, error,ordenSeleccionada, refetch: TraerOrdenes, TraerPorId, CrearOrden, EditarOrden};
}