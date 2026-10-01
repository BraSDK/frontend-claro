import { useState, useEffect,useCallback} from 'react';
import {  getOrdenById,editaOrdenCompleta,getOrdenes,crearOrdenTrabajo, editarByTecnico,eliminarOrden,getOrdenBySot } from '../../services/Ordenes/OrdenesTrabajo.service';
import type { OrdenInicialRequest, DataExtra , EditarOrdenCompletaRequest,OrdenTrabajoList, OrdenesTrabajoRequest,OrdenTrabajoDetalleResponse, CambiosTecnico  } from '../../types/Ordenes';

export function useOrdenTrabajo (params : OrdenesTrabajoRequest = {}){
    const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenTrabajoDetalleResponse| null>(null);
    const [OrdenesT,setOrdenesT] = useState<OrdenTrabajoList[]>([]);
    const [isLoading,setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page,setPage]= useState<DataExtra | null>(null);
    
    const TraerOrdenes = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await getOrdenes(params); //data la data que trae consigo una lista de interfaz
            setOrdenesT(data.listaOrdenes);
            setPage({
                totalRegistros : data.totalRegistros,
                totalRegistrosPagina : data.totalRegistrosPagina,
                numeroPagina : data.numeroPagina,
                totalPaginasTotales : data.totalPaginasTotales
            })
        } catch (err: any) {
            setError(err.response?.data?.message ?? "Error al cargar órdenes");
        } finally {
            setIsLoading(false);
        }
    }, [JSON.stringify(params)]);

    useEffect( ()=>{
        TraerOrdenes();
    },[TraerOrdenes]);

    const TraerPorId = async (id:number) => {

        try{
            setIsLoading(true);
            const ordenTrabajo = await getOrdenById(id);
            console.log(ordenTrabajo.ordenId);
            // Ya estaria demás => setOrdenSeleccionada(ordenTrabajo);
            return ordenTrabajo;
        }catch (err : any){
            setError(err);
        }finally{
            setIsLoading(false);
        }
    };
    const CrearOrden = async (orden : OrdenInicialRequest) => {
        try{
            
            setIsLoading(true);
            const ordenConfirm = await crearOrdenTrabajo({
                ...orden,Imagenes:orden.Imagenes.map((img)=> img.src)
            });
            await TraerOrdenes(); 
            return ordenConfirm;
        }catch(err : any){
            setError(err.response?.data?.message ?? "Error al crear la orden");
            throw err;

        }finally{
            setIsLoading(false);
        }
    };

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
        
    };

    const EliminarOrden = async (id:number) => {

        try{
            setIsLoading(true);
            await eliminarOrden(id);

        }catch(err : any){
            setError(err.response?.data?.message ?? "Error al crear la orden");
            throw err;
        }finally{
            setIsLoading(false);
        }

    }
    const EditarOrdenCompleta = async (ordenId:number,ordenTrabajo:EditarOrdenCompletaRequest) => {

        try{
            setIsLoading(true);
            await editaOrdenCompleta(ordenId,ordenTrabajo);

        }catch(err : any){
            setError(err.response?.data?.message ?? "Error al editar la orden");
            throw err;
        }finally{
            setIsLoading(false);
        }

    }
    const TraerBySot = async (sot:number) => {
        try{
            setIsLoading(true);
            const ordenTrabajo = await getOrdenBySot(sot);
            return ordenTrabajo;
        }catch (err: any){
            setError(err.response?.data?.message ?? "Rolando Kbro")
            throw err;
        }finally{
            setIsLoading(false);
        }
    }

    return {OrdenesT, isLoading, error,ordenSeleccionada,page, refetch: TraerOrdenes,TraerBySot, TraerPorId, CrearOrden, EditarOrden, EliminarOrden,EditarOrdenCompleta};
}