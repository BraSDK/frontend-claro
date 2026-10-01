import { useCallback, useEffect, useState } from 'react';
import { getPerfil } from '../services/auth.service';
import type { PerfilUsuario } from '../types/auth.types';

// Se guarda en memoria para no pedir /me en cada componente (Header, Configuración...)
let perfilCache: { token: string; perfil: PerfilUsuario } | null = null;
const EVENTO = 'perfil-actualizado';

export const usePerfil = () => {
    const token = localStorage.getItem('jwt_token') ?? '';
    const enCache = perfilCache?.token === token ? perfilCache.perfil : null;

    const [perfil, setPerfil] = useState<PerfilUsuario | null>(enCache);
    const [cargando, setCargando] = useState(!enCache && !!token);
    const [error, setError] = useState<string | null>(null);

    const cargar = useCallback(async () => {
        if (!token) return;
        try {
            setCargando(true);
            const data = await getPerfil();
            perfilCache = { token, perfil: data };
            setPerfil(data);
            setError(null);
        } catch {
            setError('No se pudo cargar tu perfil');
        } finally {
            setCargando(false);
        }
    }, [token]);

    useEffect(() => {
        if (!enCache) cargar();
        // cuando otro componente edita el perfil, todos los que lo muestran se actualizan
        const alActualizar = () => setPerfil(perfilCache?.perfil ?? null);
        window.addEventListener(EVENTO, alActualizar);
        return () => window.removeEventListener(EVENTO, alActualizar);
    }, [token]);

    // vuelve a pedir el perfil al back y avisa a los demás componentes
    const recargar = async () => {
        await cargar();
        window.dispatchEvent(new Event(EVENTO));
    };

    return { perfil, cargando, error, recargar };
};
