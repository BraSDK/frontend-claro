import React, { useState, useMemo } from 'react';
import { useLiquidaciones } from '../hooks/liquidacion/useLiquidaciones';
import { LiquidacionesTable } from '../components/Liquidacion/LiquidacionesTable';
import { LiquidacionFormDrawer } from '../components/Liquidacion/LiquidacionFormDrawer';        
import { FilterBar, Campo, Entrada, Selector, RangoFechas } from '@/components/shared/Filtros';
import { AccionTabla, Boton, BarPaginancion } from '@/components/shared/Tabla';
import { StatCard } from '@/components/shared/Cards';
import { ClipboardList, Wallet, Clock, CheckCircle2, FileSpreadsheet, Plus } from 'lucide-react';
import { mapGridToCrearDto, mapGridToEditarDto } from '../utils/liquidacion.mapper';
import type { ListarRequestLiquidacionesDto, FilaLiquidacionGrid } from '../types/liquidacion.types';

export const LiquidacionPage: React.FC = () => {
    const { data, loading, error, setError, params, setParams, totalRecords, crearLiquidacion, editarLiquidacion, eliminarLiquidacion, fetchLiquidaciones } = useLiquidaciones();
    
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [importarAbierto, setImportarAbierto] = useState(false);
    const [liquidacionActiva, setLiquidacionActiva] = useState<ListarRequestLiquidacionesDto | null>(null);

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
        montoTotal: data.reduce((sum, item) => sum + (item.precioTotalEditable || 0), 0),
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

    return (
        <div className="flex flex-col gap-5">
            <FilterBar onBuscar={aplicarBusqueda} onLimpiar={limpiarFiltros} hayFiltros={hayFiltros}>
                {/* Tus Campos de filtro se mantienen intactos */}
                <Campo label="SOT">
                    <Entrada inputMode="numeric" value={textoBusqueda} onChange={(e) => setTextoBusqueda(e.target.value)} placeholder="Ingrese el número de SOT" />
                </Campo>
                <Campo label="Estado">
                    <Selector value={estado} onChange={(e) => cambiarFiltro(setEstado)(e.target.value === '' ? '' : Number(e.target.value))}>
                        <option value="">Todos</option>
                        <option value="1">Ingresada</option>
                        <option value="2">Validada</option>
                    </Selector>
                </Campo>
                <Campo label="Fecha de programación">
                    <RangoFechas desde={desde} hasta={hasta} onDesde={cambiarFiltro(setDesde)} onHasta={cambiarFiltro(setHasta)} />
                </Campo>
            </FilterBar>

            {/* Errores del guardado (por SOT) o de la carga: antes se perdían sin mostrarse */}
            {error && <div className="rounded-control bg-danger-soft px-4 py-2 text-sm text-danger">{error}</div>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Liquidaciones en vista" icon={ClipboardList} value={metricas.totalLiquidaciones} iconClassName="bg-info-soft text-info" />
                <StatCard title="Monto Editable (Pág. actual)" icon={Wallet} value={`S/ ${metricas.montoTotal.toFixed(2)}`} iconClassName="bg-success-soft text-success" />
                <StatCard title="Ingresadas" icon={Clock} value={metricas.ingresadas} iconClassName="bg-info-soft text-info" />
                <StatCard title="Validadas / Liquidadas" icon={CheckCircle2} value={metricas.validadas} iconClassName="bg-success-soft text-success" />
            </div>

            {/* Invocamos a la tabla pasando botones extras y paginación como props */}
            <LiquidacionesTable 
                liquidaciones={data} 
                isLoading={loading} 
                onAutoSave={handleAutoSave}
                onDelete={handleDelete}
                accionesExtras={
                    <>
                        <AccionTabla icono={<FileSpreadsheet size={16} />} onClick={() => setImportarAbierto(true)}>
                            Importar Excel
                        </AccionTabla>
                        <Boton icono={<Plus size={16} />} onClick={() => { setLiquidacionActiva(null); setDrawerAbierto(true); }} className="ml-1">
                            Nueva Liquidación
                        </Boton>
                    </>
                }
                pie={
                    <BarPaginancion
                        onHandle={(pagina: number) => setParams(prev => ({ ...prev, pagina }))}
                        numeroPagina={params.pagina || 1}
                        totalRegistros={totalRecords}
                        totalRegistrosPagina={params.canPagina || 15}
                        totalPaginasTotales={Math.ceil(totalRecords / (params.canPagina || 15))}
                    />
                }
            />
            
            <LiquidacionFormDrawer 
                isOpen={drawerAbierto} 
                onClose={() => setDrawerAbierto(false)} 
                liquidacion={liquidacionActiva}
            />
        </div>
    );
};