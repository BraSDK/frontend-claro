import { useState, useEffect } from 'react';
import { getServicios } from '../../services/servicio.service';
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
    return { servicios, isLoading, error, refetch: fetchServicios };
}