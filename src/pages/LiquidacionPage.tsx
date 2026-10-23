import React, { useState, useMemo } from 'react';
import { useLiquidaciones } from '../hooks/liquidacion/useLiquidaciones';
import { LiquidacionFilters } from '../components/Liquidacion/LiquidacionFilters';
import { LiquidacionesTable } from '../components/Liquidacion/LiquidacionesTable';
import { LiquidacionFormDrawer } from '../components/Liquidacion/LiquidacionFormDrawer';        

// Importa tus componentes compartidos (ajusta las rutas según tu proyecto)
import { FilterBar, Campo, Entrada, Selector, RangoFechas } from '@/components/shared/Filtros';
import { DataTable, AccionTabla, Boton, BarPaginancion } from '@/components/shared/Tabla';
import { StatCard } from '@/components/shared/Cards';
import { ClipboardList, Wallet, Clock, CheckCircle2, FileSpreadsheet, Plus } from 'lucide-react';

export const LiquidacionPage: React.FC = () => {
    const { data, loading, params, setParams, totalRecords } = useLiquidaciones();
    
    // Estados para el Modal/Drawer de importación y creación
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [importarAbierto, setImportarAbierto] = useState(false);

    // Estados locales para los filtros antes de aplicar la búsqueda
    const [textoBusqueda, setTextoBusqueda] = useState(params.buscar || '');
    const [estado, setEstado] = useState<string | number>(params.estado || '');
    const [desde, setDesde] = useState(params.desde || '');
    const [hasta, setHasta] = useState(params.hasta || '');

    const hayFiltros = Boolean(textoBusqueda || estado || desde || hasta);

    const aplicarBusqueda = () => {
        setParams((prev) => ({
            ...prev,
            buscar: textoBusqueda,
            estado: estado,
            desde: desde,
            hasta: hasta,
            pagina: 1 // Reiniciar a la primera página al buscar
        }));
    };

    const limpiarFiltros = () => {
        setTextoBusqueda('');
        setEstado('');
        setDesde('');
        setHasta('');
        setParams({ pagina: 1, canPagina: 15 });
    };

    const cambiarFiltro = (setter: React.Dispatch<React.SetStateAction<any>>) => (valor: any) => {
        setter(valor);
    };

    // Cálculos simulados para las StatCards (puedes conectarlos a un endpoint de resumen luego)
    const metricas = useMemo(() => {
        return {
            totalLiquidaciones: totalRecords,
            montoTotal: data.reduce((sum, item) => sum + (item.precioTotalEditable || 0), 0),
            ingresadas: data.filter(d => d.estadoSistema === 'Ingresada' || d.estadoSistema === 1).length,
            validadas: data.filter(d => d.estadoSistema === 'Validada' || d.estadoSistema === 2).length,
        };
    }, [data, totalRecords]);

    return (
        <div className="flex flex-col gap-5">
            {/* Filtros */}
            <FilterBar onBuscar={aplicarBusqueda} onLimpiar={limpiarFiltros} hayFiltros={hayFiltros}>
                <Campo label="SOT">
                    <Entrada
                        inputMode="numeric"
                        value={textoBusqueda}
                        onChange={(e) => setTextoBusqueda(e.target.value)}
                        placeholder="Ingrese el número de SOT"
                    />
                </Campo>
                <Campo label="Estado">
                    <Selector
                        value={estado}
                        onChange={(e) => cambiarFiltro(setEstado)(e.target.value === '' ? '' : Number(e.target.value))}
                    >
                        <option value="">Todos</option>
                        <option value="1">Ingresada</option>
                        <option value="2">Validada</option>
                    </Selector>
                </Campo>
                <Campo label="Fecha de programación">
                    <RangoFechas 
                        desde={desde} 
                        hasta={hasta} 
                        onDesde={cambiarFiltro(setDesde)} 
                        onHasta={cambiarFiltro(setHasta)} 
                    />
                </Campo>
            </FilterBar>

            {/* Tarjetas de Métricas */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Liquidaciones en vista"
                    icon={ClipboardList}
                    value={metricas.totalLiquidaciones}
                    iconClassName="bg-info-soft text-info"
                />
                <StatCard
                    title="Monto Editable (Pág. actual)"
                    icon={Wallet}
                    value={`S/ ${metricas.montoTotal.toFixed(2)}`}
                    iconClassName="bg-success-soft text-success"
                />
                <StatCard
                    title="Ingresadas"
                    icon={Clock}
                    value={metricas.ingresadas}
                    iconClassName="bg-info-soft text-info"
                />
                <StatCard
                    title="Validadas / Liquidadas"
                    icon={CheckCircle2}
                    value={metricas.validadas}
                    iconClassName="bg-success-soft text-success"
                />
            </div>

            {/* Listado con el Wrapper DataTable */}
            <DataTable
                titulo="Listado de Liquidaciones"
                cantidad={totalRecords}
                acciones={
                    <>
                        <AccionTabla 
                            icono={<FileSpreadsheet size={16} />} 
                            onClick={() => setImportarAbierto(true)}
                        >
                            Importar Excel
                        </AccionTabla>
                        
                        <Boton 
                            icono={<Plus size={16} />} 
                            onClick={() => setDrawerAbierto(true)} 
                            className="ml-1"
                        >
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
            >
                {/* Tabla Pura */}
                <LiquidacionesTable liquidaciones={data} isLoading={loading} />
            </DataTable>

            {/* Drawer de Creación/Edición */}
            <LiquidacionFormDrawer 
                isOpen={drawerAbierto} 
                onClose={() => setDrawerAbierto(false)} 
                onSubmit={async (datos) => {
                    // Lógica temporal para conectar con useLiquidaciones luego
                    console.log("Guardando", datos);
                    setDrawerAbierto(false);
                }} 
            />
        </div>
    );
};