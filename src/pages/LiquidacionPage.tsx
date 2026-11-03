import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLiquidaciones } from '../hooks/liquidacion/useLiquidaciones';
import { LiquidacionesTable } from '../components/Liquidacion/LiquidacionesTable';
import { LiquidacionFormDrawer } from '../components/Liquidacion/LiquidacionFormDrawer';    
    
import { PreciosAdicionalesModal } from '../components/Liquidacion/PreciosAdicionalesModal';
import { Campo, Entrada, Selector, RangoFechas } from '@/components/shared/Filtros';
import { AccionTabla, Boton, BarPaginancion } from '@/components/shared/Tabla';
import { FileSpreadsheet, Tags, Search, FilterX } from 'lucide-react';
import { mapGridToCrearDto, mapGridToEditarDto, preciosDesdeCatalogo } from '../utils/liquidacion.mapper';
import { getAdicionales } from '../services/liquidacion.service';
import { useAuth } from '../hooks/useAuth';
import type { ListarRequestLiquidacionesDto, FilaLiquidacionGrid, AdicionalDto } from '../types/liquidacion.types';
import { FilterBar } from '../components/ui/FilterBar';

export const LiquidacionPage: React.FC = () => {
    const { data, loading, error, setError, params, setParams, totalRecords, crearLiquidacion, editarLiquidacion, eliminarLiquidacion, fetchLiquidaciones } = useLiquidaciones();
    
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [importarAbierto, setImportarAbierto] = useState(false);
    const [liquidacionActiva, setLiquidacionActiva] = useState<ListarRequestLiquidacionesDto | null>(null);

    // Catálogo de precios de DECO, REPETIDOR y DROP: con él se calcula el total de cada fila
    const { rol } = useAuth();
    const [catalogo, setCatalogo] = useState<AdicionalDto[]>([]);
    const [preciosAbierto, setPreciosAbierto] = useState(false);
    const precios = useMemo(() => preciosDesdeCatalogo(catalogo), [catalogo]);
    const cargarCatalogo = useCallback(() => {
        getAdicionales().then(setCatalogo).catch(() => setCatalogo([]));
    }, []);
    useEffect(() => { cargarCatalogo(); }, [cargarCatalogo]);

    const [textoBusqueda, setTextoBusqueda] = useState(params.buscar || '');
    const [estado, setEstado] = useState<string | number>(params.estado || '');
    const [desde, setDesde] = useState(params.desde || '');
    const [hasta, setHasta] = useState(params.hasta || '');

    const hayFiltros = Boolean(textoBusqueda || estado || desde || hasta);

    const aplicarBusqueda = () => {
        setParams((prev) => ({
            ...prev, buscar: textoBusqueda, estado, desde, hasta, pagina: 1 
        }));
    };

    const limpiarFiltros = () => {
        setTextoBusqueda(''); setEstado(''); setDesde(''); setHasta('');
        setParams({ pagina: 1, canPagina: 15 });
    };

    const cambiarFiltro = (setter: React.Dispatch<React.SetStateAction<any>>) => (valor: any) => setter(valor);

    const metricas = useMemo(() => ({
        totalLiquidaciones: totalRecords,
        // las SOT que no se pagan (estadoPago 2 u observación de no pago) no suman
        montoTotal: data.reduce((sum, item) => {
            const noPago = item.estadoPago === 2 || (item.observaciones ?? []).some((o) => o.tipo === 2 && o.texto?.trim());
            return sum + (noPago ? 0 : item.precioTotalEditable ?? item.precioTotalReal ?? 0);
        }, 0),
        ingresadas: data.filter(d => d.estadoSistema === 'Ingresada' || d.estadoSistema === 1).length,
        validadas: data.filter(d => d.estadoSistema === 'Validada' || d.estadoSistema === 2).length,
    }), [data, totalRecords]);

    // Autoguardado desde RevoGrid: recibe 1 fila (edición simple) o varias (pegado / autollenado).
    // Solo se guardan las filas con SOT; existentes → PUT por SOT, nuevas → POST. Se recarga una sola vez al final.
    const handleAutoSave = async (filas: Partial<FilaLiquidacionGrid>[]) => {
        const conSot = filas.filter((f) => Number(f.sot) > 0);
        if (conSot.length === 0) return;

        const errores: string[] = [];
        for (const fila of conSot) {   // en orden, una petición a la vez
            const sot = Number(fila.sot);
            const err = fila.esRegistroExistente
                ? await editarLiquidacion(sot, mapGridToEditarDto(fila), false)
                : await crearLiquidacion(mapGridToCrearDto(fila), false);
            if (err) errores.push(`SOT ${sot}: ${err}`);
            else fila.esRegistroExistente = true;   // si se vuelve a editar antes de recargar, ya va como PUT
        }

        setError(errores.length ? errores.join(' · ') : null);
        await fetchLiquidaciones();
    };

    const handleDelete = async (sot: number) => {
        if (!window.confirm(`¿Seguro que deseas eliminar la liquidación SOT: ${sot}?`)) return;
        try {
            await eliminarLiquidacion(sot);   // DELETE /Liquidacion/{sot}/delete y recarga
        } catch {
            // el hook ya deja el mensaje en `error`
        }
    };

    // Vista tipo hoja (Google Sheets): pegada al header y a los bordes, sin tarjetas.
    // Arriba una barra de herramientas de una línea, en medio la hoja y abajo la barra de estado.
    return (
        <div className="flex h-[calc(100vh-58px)] flex-col bg-white">
            {/* Barra de herramientas: filtros compactos + acciones */}

           <FilterBar onBuscar={aplicarBusqueda} onLimpiar={limpiarFiltros} hayFiltros={hayFiltros}>
                
                    <Campo label="SOT">
                        <Entrada inputMode="numeric" value={textoBusqueda} onChange={(e)=>setTextoBusqueda(e.target.value) }/>
                    </Campo>
                    <Selector className="!h-[28px] w-32" value={estado} onChange={(e) => cambiarFiltro(setEstado)(e.target.value === '' ? '' : Number(e.target.value))}>
                        <option value="">Estado</option>
                        <option value="1">Ingresada</option>
                        <option value="2">Validada</option>
                    </Selector>
                    <Campo label="fechaProgramacion">
                        <RangoFechas desde={desde} hasta={hasta} onDesde={cambiarFiltro(setDesde)} onHasta={cambiarFiltro(setHasta)} />
                    </Campo>
                
            </FilterBar>

            {/* Errores del guardado (por SOT) o de la carga */}
            {error && <div className="border-b border-danger/30 bg-danger-soft px-3 py-1 text-sm text-danger">{error}</div>}

            {/* La hoja ocupa todo el espacio libre */}
            <div className="min-h-0 flex-1">
                <LiquidacionesTable
                    liquidaciones={data}
                    isLoading={loading}
                    onAutoSave={handleAutoSave}
                    onDelete={handleDelete}
                    precios={precios}
                />
            </div>

            {/* Barra de estado (como la de Sheets): resumen de la página y paginación */}
            <footer className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-gray-300 bg-gray-50 px-3 py-1 text-xs text-gray-600">
                <span><b className="text-gray-800">{metricas.totalLiquidaciones}</b> liquidaciones</span>
                <span>Monto: <b className="text-gray-800">S/ {metricas.montoTotal.toFixed(2)}</b></span>
                <span>Ingresadas: <b className="text-gray-800">{metricas.ingresadas}</b></span>
                <span>Validadas: <b className="text-gray-800">{metricas.validadas}</b></span>
                <div className="ml-auto">
                    <BarPaginancion
                        onHandle={(pagina: number) => setParams(prev => ({ ...prev, pagina }))}
                        numeroPagina={params.pagina || 1}
                        totalRegistros={totalRecords}
                        totalRegistrosPagina={params.canPagina || 15}
                        totalPaginasTotales={Math.max(1, Math.ceil(totalRecords / (params.canPagina || 15)))}
                    />
                </div>
            </footer>

            <PreciosAdicionalesModal
                abierto={preciosAbierto}
                onCerrar={() => setPreciosAbierto(false)}
                catalogo={catalogo}
                puedeEditar={rol === 'ADMIN'}
                onGuardado={() => { cargarCatalogo(); fetchLiquidaciones(); }}
            />
        </div>
    );
};
