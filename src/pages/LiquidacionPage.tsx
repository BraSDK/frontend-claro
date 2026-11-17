import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLiquidaciones } from '../hooks/liquidacion/useLiquidaciones';
import { LiquidacionesTable } from '../components/Liquidacion/LiquidacionesTable';  
    
import { PreciosAdicionalesModal } from '../components/Liquidacion/PreciosAdicionalesModal';
import { Campo, Entrada, Selector, RangoFechas } from '@/components/shared/Filtros';
import { BarPaginancion } from '@/components/shared/Tabla';
import { FileSpreadsheet } from 'lucide-react';
import { mapGridToCrearDto, mapGridToEditarDto, preciosDesdeCatalogo } from '../utils/liquidacion.mapper';
import { getAdicionales } from '../services/liquidacion.service';
import { useAuth } from '../hooks/useAuth';
import type { FilaLiquidacionGrid, AdicionalDto } from '../types/liquidacion.types';
import { FilterBar } from '../components/ui/FilterBar';
import { exportarAExcel } from '../utils/exportarExcel';
import { useHojas } from '../hooks/liquidacion/useHojas';
import { PestanasHojas } from '../components/Liquidacion/PestanasHojas';
import { api } from '../api/api';

export const LiquidacionPage: React.FC = () => {
    const { data, loading, error, setError, params, setParams, totalRecords, crearLiquidacion, editarLiquidacion, eliminarLiquidacion, fetchLiquidaciones, evaluarImportacion, restaurarSot  } = useLiquidaciones();

    // ===== Hojas (una por mes) =====
    // La grilla muestra solo la hoja activa (params.hojaId). Al entrar se abre la del mes actual.
    const { hojas, error: errorHojas, recargar: recargarHojas, renombrar: renombrarHoja } = useHojas();
    // si las hojas no cargan (back sin el endpoint, sin conexión...) la grilla muestra todo, como antes
    const esperandoHoja = !params.hojaId && !errorHojas;
    const hoy = new Date();
    const hojaDelMes = hojas.find((h) => h.anio === hoy.getFullYear() && h.mes === hoy.getMonth() + 1);
    const hojaActiva = hojas.find((h) => h.hojaId === params.hojaId);

    useEffect(() => {
        if (params.hojaId || hojas.length === 0) return;
        const inicial = hojaDelMes ?? hojas[0];
        setParams((prev) => ({ ...prev, hojaId: inicial.hojaId, pagina: 1 }));
    }, [hojas, hojaDelMes, params.hojaId, setParams]);

    const seleccionarHoja = (hojaId: number) => {
        setParams((prev) => ({ ...prev, hojaId, pagina: 1 }));
    };
    // Catálogo de precios de DECO, REPETIDOR y DROP: con él se calcula el total de cada fila
    const { rol } = useAuth();
    const [catalogo, setCatalogo] = useState<AdicionalDto[]>([]);
    const [preciosAbierto, setPreciosAbierto] = useState(false);
    const precios = useMemo(() => preciosDesdeCatalogo(catalogo), [catalogo]);
    const codigos = useMemo(()=> preciosDesdeCatalogo(catalogo),[catalogo]);
    
    const cargarCatalogo = useCallback(() => {
        getAdicionales().then(setCatalogo).catch(() => setCatalogo([]));
    }, []);

    useEffect(() => { 
        cargarCatalogo(); 
    }, [cargarCatalogo]);

    const [textoBusqueda, setTextoBusqueda] = useState(params.buscar || '');
    const [desde, setDesde] = useState(params.desde || '');
    const [hasta, setHasta] = useState(params.hasta || '');
    const [tabActiva, setTabActiva] = useState< 'activas' | 'rechazadas'>('activas');

    const cambiarTab = (nuevaTab: 'activas' | 'rechazadas') => {
        setTabActiva(nuevaTab);

        setTextoBusqueda('');
        setDesde('');
        setHasta('');
        setParams(prev => ({
            ...prev,
            estado: nuevaTab === 'rechazadas' ? 4 : undefined,
            pagina:1
        }));
    };

    const estado = params.estado || '';

    const hayFiltros = Boolean(textoBusqueda || estado || desde || hasta);

    const aplicarBusqueda = () => {
        setParams((prev) => ({
            ...prev, 
            buscar: textoBusqueda, 
            desde, 
            hasta, 
            pagina: 1 
        }));
    };

    const actualizarFiltroDirecto = (key: string, valor: any) => {
        setParams(prev => ({
            ...prev,
            [key]: valor === '' ? undefined : valor,
            pagina: 1 // Siempre volvemos a la página 1 al filtrar
        }));
    };

    const limpiarFiltros = () => {
        setTextoBusqueda('');
        setDesde('');
        setHasta('');
        setParams((prev) => ({ pagina: 1, canPagina: 20, hojaId: prev.hojaId }));   // limpiar filtros no cambia de hoja
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
        recargarHojas();   // actualiza el contador de cada pestaña (una SOT nueva puede caer en otra hoja)
    };

    const handleDelete = async (sot: number) => {
        if (!window.confirm(`¿Seguro que deseas eliminar la liquidación SOT: ${sot}?`)) return;
        try {
            await eliminarLiquidacion(sot);   // DELETE /Liquidacion/{sot}/delete y recarga
            recargarHojas();
        } catch {
            // el hook ya deja el mensaje en `error`
        }
    };

    const handleExportar = () => {
        if (!data || data.length === 0) {
            alert("No hay liquidaciones registradas para exportar.");
            return;
        }
        // Puedes mapearla si quieres cambiar los nombres de las columnas antes de exportar
        const datosMapeados = data.map(fila => ({
            "SOT": fila.sot,
            "Tipo Orden": fila.tipoOrden || '', 
            "SubTipo Orden": fila.nombreSubTipoOrden || '',
            "Técnico": fila.nombreTecnico || 'Sin asignar',
            "Fecha Programación": fila.fechaProgramacion || '',
            "Estado Sistema": fila.estadoSistema === 1 ? 'Ingresada' : fila.estadoSistema === 2 ? 'Validada' : fila.estadoSistema,
            "Precio Total": fila.precioTotalEditable ?? fila.precioTotalReal ?? 0
        }));
    
        exportarAExcel(datosMapeados, 'Liquidaciones');
    };
    console.log("Parámetros actuales que van al hook:", params);
    // Vista tipo hoja (Google Sheets): pegada al header y a los bordes, sin tarjetas.
    // Arriba una barra de herramientas de una línea, en medio la hoja y abajo la barra de estado.
    return (
        <div className="flex h-[calc(100vh-58px)] flex-col bg-white mt-4">
            {/* Barra de herramientas: filtros compactos + acciones */}

            <div className="flex border-b border-gray-200 px-4 pt-2">
            <button
                onClick={() => cambiarTab('activas')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    tabActiva === 'activas' 
                    ? 'border-emerald-600 text-emerald-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Liquidaciones Activas
                </button>
                <button
                    onClick={() => cambiarTab('rechazadas')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        tabActiva === 'rechazadas' 
                        ? 'border-red-600 text-red-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Rechazadas
                </button>
            </div>
            <FilterBar pegado={true} onBuscar={aplicarBusqueda} onLimpiar={limpiarFiltros} hayFiltros={hayFiltros}>
                        <Campo label="SOT">
                            <Entrada inputMode="numeric" value={textoBusqueda} onChange={(e)=>setTextoBusqueda(e.target.value) }/>
                        </Campo>
                        <Selector 
                            className="!h-[28px] w-36" 
                            value={estado} 
                            onChange={(e) => actualizarFiltroDirecto('estado', e.target.value === '' ? undefined : Number(e.target.value))}
                        >
                            <option value="">Todos los estados</option>
                            <option value="1">Ingresada</option>
                            <option value="2">Validada</option>
                            <option value="3">Importada (Pendiente)</option>
                            <option value="4">Rechazadas</option> {/* 👈 Agregado */}
                        </Selector>
                        <Campo label="fechaProgramacion">
                            <RangoFechas desde={desde} hasta={hasta} onDesde={cambiarFiltro(setDesde)} onHasta={cambiarFiltro(setHasta)} />
                        </Campo>
                        {/* Botón de Exportar Excel */}
                        <button
                            type="button"
                            onClick={handleExportar}
                            className="inline-flex h-[28px] items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                            title="Exportar liquidaciones a Excel"
                        >
                            <FileSpreadsheet size={14} className="text-white" />
                            <span>Exportar</span>
                        </button>
                        <button 
                            type="button"
                            className="inline-flex h-[28px] items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                            title="Traer precios"
                            onClick={() => setPreciosAbierto(true)}               
                        >
                            <span>Precios</span>
                            
                        </button>

            </FilterBar>

            <button
                type="button"
                onClick={async () => {
                    if (!confirm('⚠️ ¿Eliminar TODAS las SOTs en estado IMPORTADA?\n\nEsta acción no se puede deshacer.')) return;
                    try {
                        const res = await api.delete('/Liquidacion/EliminarImportadas');
                        alert(`✅ ${res.data.eliminadas} SOTs eliminadas`);
                        fetchLiquidaciones();   // ✅ ya existe en este scope
                    } catch (e: any) {
                        alert('Error: ' + (e?.response?.data?.mensaje ?? e.message));
                    }
                }}
                className="rounded-control bg-danger px-3 py-2 text-sm text-white hover:bg-danger/90"
            >
                Eliminar Importadas (temporal)
            </button>

            {/* Errores del guardado (por SOT) o de la carga */}
            {error && <div className="border-b border-danger/30 bg-danger-soft px-3 py-1 text-sm text-danger">{error}</div>}

            {/* La hoja de cada SOT la decide su mes de creación: en una hoja pasada, las nuevas se van a la del mes actual */}
            {hojaActiva && hojaDelMes && hojaActiva.hojaId !== hojaDelMes.hojaId && (
                <div className="border-b border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-800">
                    Estás viendo <b>{hojaActiva.nombre}</b>. Las SOT nuevas se guardan en la hoja <b>{hojaDelMes.nombre}</b>.
                </div>
            )}

            {/* La hoja ocupa todo el espacio libre */}
            <div className="min-h-0 flex-1">
                <LiquidacionesTable
                    liquidaciones={esperandoHoja ? [] : data}
                    isLoading={loading || esperandoHoja}   /* hasta elegir la hoja no se muestra nada (evita ver todas por un instante) */
                    onAutoSave={handleAutoSave}
                    onDelete={handleDelete}
                    precios={precios}
                    onAprobarImportacion={(sot) => evaluarImportacion(sot, true)}
                    onRechazarImportacion={(sot) => evaluarImportacion(sot, false)}
                    onRestaurarImportacion={(sot) => restaurarSot(sot)}
                />
            </div>

            {/* Pestañas de hojas (una por mes), como en Sheets */}
            <PestanasHojas
                hojas={hojas}
                hojaActivaId={params.hojaId}
                onSeleccionar={seleccionarHoja}
                onRenombrar={renombrarHoja}
            />

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
                        totalRegistrosPagina={params.canPagina || 20}
                        totalPaginasTotales={Math.max(1, Math.ceil(totalRecords / (params.canPagina || 20)))}
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
