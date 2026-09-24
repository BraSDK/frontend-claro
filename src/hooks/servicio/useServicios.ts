import { useState, useEffect } from 'react';
import { getServicios, updateServicios, postServicios, deleteServicios } from '../../services/servicio.service';
import type { Servicio } from '../../types/servicio';

export const useServicios = () => {
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchServicios = async () => {
        try {
            setIsLoading(true);
            const data = await getServicios();
            setServicios(data);
        }catch (err: any){
            setError('Error al cargar servicios.');
        }finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServicios();
    }, []);

    const createServicios = async (nuevoServicio: Partial<Servicio>) => {
        try{
            // Enviamos la solicitud al back
            setIsLoading(true);
            await postServicios(nuevoServicio);
            // refrescar
            await fetchServicios();
        }catch{
            setError('Error al crear el servicio.')
        }finally {
            setIsLoading(false);
        }
    };

    const editServicios = async (codigo: number, datosActualizados: Partial<Servicio>) => {
        try {
            setIsLoading(true);
            await updateServicios(codigo, datosActualizados);
            
            // Buscamos el servicio viejo y lo mezclamos con los datos nuevos
            setServicios(serviciosActuales => 
                serviciosActuales.map(servicio => 
                    servicio.codigo === codigo 
                        ? { ...servicio, ...datosActualizados } 
                        : servicio
                )
            );
        } catch (err: any) {
            setError('Error al actualizar el servicio.');
            throw err;
        } finally{
            setIsLoading(false);
        }
    };

    const removeServicios = async (codigo: number) => {
        try{
            setIsLoading(true);
            await deleteServicios(codigo);
            await fetchServicios();
        }catch(err: any){
            setError('Error al eliminar el servicio');
            throw err;
        }finally{

        }
    }

    return { servicios, isLoading, error, refetch: fetchServicios, editServicios, createServicios, removeServicios };
}