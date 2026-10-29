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
    const { data, loading, params, setParams, totalRecords, crearLiquidacion, editarLiquidacion, fetchLiquidaciones, eliminarLiquidacion } = useLiquidaciones();
    
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

    // Función para autoguardado desde RevoGrid
    const handleAutoSave = async (filaPlana: Partial<FilaLiquidacionGrid>) => {
        console.log('🔵 handleAutoSave - fila recibida:', filaPlana);

        if (!filaPlana.sot || !filaPlana.tecnico || !filaPlana.fechaProgramacion) {
            console.log('⏳ Fila incompleta, esperando más datos...');
            return;
          }
          
        try {
            if (filaPlana.esRegistroExistente && filaPlana.sot) {
              await editarLiquidacion(filaPlana.sot, mapGridToEditarDto(filaPlana));
            } else if (filaPlana.sot) {
              await crearLiquidacion(mapGridToCrearDto(filaPlana));
        
              // Marcar registro como existente y limpiar memoria local
              filaPlana.esRegistroExistente = true;
              localStorage.removeItem('liquidaciones_grid_draft_auto_v1');
            }
          } catch (error) {
            console.error('Error en el autoguardado:', error);
          }
    };

    const handleDelete = async (sot: number) => {
        if (window.confirm(`¿Seguro que deseas eliminar la liquidación SOT: ${sot}?`)) {
            console.log("Eliminando SOT:", sot);
            await eliminarLiquidacion(sot)
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
                onRefresh={fetchLiquidaciones}
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