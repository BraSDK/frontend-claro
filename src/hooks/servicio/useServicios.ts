import { useState, useEffect } from 'react';
import { getServicios, updateServicios, postServicios } from '../../services/servicio.service';
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

    const createServicios = async (codigo:number) => {
        try{

        }catch{

        }finally {

        }
    };

    const editServicios = async (codigo: number, datosActualizados: Partial<Servicio>) => {
        try{
            setIsLoading(true);
            const data = await updateServicios(codigo, datosActualizados);
            setServicios((prevServicios) =>
                prevServicios.map((servicio) =>
                    servicio.codigo === codigo ? data : servicio
            )
        );
        }catch (err: any){
            setError('Error al cargar servicioEditar')
            throw err;
        }finally {
            setIsLoading(false);
        }
    };

    return { servicios, isLoading, error, refetch: fetchServicios, editServicios, createServicios };
}