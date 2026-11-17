import { useCallback, useEffect, useState } from 'react';
import { listarHojas, renombrarHoja } from '../../services/hoja.service';
import type { Hoja } from '../../types/hoja.types';

// Pestañas de la grilla de liquidaciones (una hoja por mes)
export const useHojas = () => {
    const [hojas, setHojas] = useState<Hoja[]>([]);
    const [error, setError] = useState<string | null>(null);

    const recargar = useCallback(async () => {
        try {
            setHojas(await listarHojas());
            setError(null);
        } catch {
            setError('No se pudieron cargar las hojas');
        }
    }, []);

    useEffect(() => { recargar(); }, [recargar]);

    // Devuelve el mensaje de error (o null) para que la pestaña decida si deja el nombre anterior
    const renombrar = async (hojaId: number, nombre: string): Promise<string | null> => {
        try {
            const actualizada = await renombrarHoja(hojaId, nombre);
            setHojas((prev) => prev.map((h) => (h.hojaId === hojaId ? actualizada : h)));
            return null;
        } catch (e: any) {
            return e?.response?.data?.error ?? 'No se pudo renombrar la hoja';
        }
    };

    return { hojas, error, recargar, renombrar };
};
