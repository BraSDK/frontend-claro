import { useCallback, useEffect, useMemo, useState } from 'react';
import { listarOrdenes, mensajeError } from '../../services/Ordenes/OrdenesTrabajo.service';
import { getUsuarios } from '../../services/usuario.service';
import { useAuth } from '../useAuth';
import type { PagedResponse } from '../../types/paginacion';
import type { ListarOrdenesParams, OrdenTrabajo } from '../../types/Ordenes';

// Listado paginado de órdenes de trabajo; se vuelve a pedir cuando cambian los parámetros
// (mientras llega la nueva respuesta se siguen mostrando los datos anteriores)
export function useOrdenes(params: ListarOrdenesParams) {
    const clave = JSON.stringify(params);
    const [version, setVersion] = useState(0);
    const peticion = `${clave}#${version}`;
    const [respuesta, setRespuesta] = useState<{ peticion: string; pagina: PagedResponse<OrdenTrabajo> | null; error: string | null } | null>(null);

    useEffect(() => {
        let vigente = true;
        listarOrdenes(JSON.parse(clave))
            .then((pagina) => { if (vigente) setRespuesta({ peticion, pagina, error: null }); })
            .catch((err) => {
                if (vigente) setRespuesta((r) => ({ peticion, pagina: r?.pagina ?? null, error: mensajeError(err, 'No se pudieron cargar las órdenes.') }));
            });

        return () => { vigente = false; };
    }, [clave, peticion]);

    const recargar = useCallback(() => setVersion((v) => v + 1), []);
    const pagina = respuesta?.pagina ?? null;
    return {
        ordenes: pagina?.listaGenerica ?? [],
        pagina,
        cargando: respuesta?.peticion !== peticion,
        error: respuesta?.peticion === peticion ? respuesta.error : null,
        recargar,
    };
}

// Qué puede hacer cada rol, según los [Authorize(Roles = ...)] de OrdenTrabajoController
export function usePermisosOrden() {
    const { rol } = useAuth();
    return {
        puedeCrear: rol === 'ADMIN' || rol === 'TECNICO',
        puedeEditarCampos: rol === 'ADMIN' || rol === 'ALMACEN',       // edicion-rapida
        puedeGestionarImagenes: rol === 'ADMIN' || rol === 'TECNICO',  // archivos
        puedeEliminar: true,
        esTecnico: rol === 'TECNICO',
    };
}

export interface TecnicoOpcion { documento: string; nombre: string }

// Técnicos para mostrar el nombre a partir del documento (docTecnico de la OT = documentoIdentidad del usuario).
// /User/list devuelve el Id de la cuenta, no el del perfil, por eso se cruza por documento y no por usuarioId.
export function useTecnicos(habilitado = true) {
    const [tecnicos, setTecnicos] = useState<TecnicoOpcion[]>([]);

    useEffect(() => {
        if (!habilitado) return;
        getUsuarios({ rol: 'TECNICO', cantidadPorPagina: 200 })
            .then((lista) => setTecnicos(
                lista
                    .filter((u) => u.documentoIdentidad)
                    .map((u) => ({ documento: u.documentoIdentidad.trim(), nombre: u.nombreCompleto }))
                    .sort((a, b) => a.nombre.localeCompare(b.nombre))
            ))
            .catch(() => setTecnicos([]));   // sin la lista solo se pierde el nombre: se muestra el documento
    }, [habilitado]);

    const porDocumento = useMemo(() => new Map(tecnicos.map((t) => [t.documento, t.nombre])), [tecnicos]);
    const nombreDe = useCallback((doc: string) => porDocumento.get(doc?.trim()) ?? null, [porDocumento]);

    return { tecnicos, nombreDe };
}
