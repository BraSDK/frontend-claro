import React, { useState, useEffect, useMemo,useRef } from 'react';
import { RevoGrid } from '@revolist/react-datagrid';
import { temaClaro } from '@/theme/revogrid-theme';
import { DataTable } from '@/components/shared/Tabla';
import type { ListarRequestLiquidacionesDto, FilaLiquidacionGrid } from '../../types/liquidacion.types';
import { getLiquidacionesColumns, gridEditors } from './liquidacionesColumns';

const MAX_FILAS_EXCEL = 200;

interface LiquidacionesTableProps {
  liquidaciones: ListarRequestLiquidacionesDto[];
  isLoading: boolean;
  onAutoSave: (filas: Partial<FilaLiquidacionGrid>[]) => Promise<void>;   // 1 fila (edición) o varias (pegado/autollenado)
  onDelete?: (sot: number) => void;
  accionesExtras?: React.ReactNode;
  pie?: React.ReactNode;
}

// Fila nueva que el usuario ya empezó a llenar (todavía no está en el servidor)
const esFilaPendiente = (f: Partial<FilaLiquidacionGrid>) =>
  !f.esRegistroExistente && Object.values(f).some((v) => v !== undefined && v !== null && v !== '');

export const LiquidacionesTable: React.FC<LiquidacionesTableProps> = ({
  liquidaciones,
  isLoading,
  onAutoSave,
  onDelete,
  accionesExtras,
  pie
}) => {
  const [gridData, setGridData] = useState<Partial<FilaLiquidacionGrid>[]>([]);
  const gridRef = useRef<HTMLRevoGridElement>(null); // traemos todos los metodos de revogrid

  // Función traductora: APLANA el JSON anidado del backend hacia columnas planas
  const aplanarDatos = (datosServidor: ListarRequestLiquidacionesDto[]): FilaLiquidacionGrid[] => {
    return datosServidor.map(liq => {
      const filaPlana: FilaLiquidacionGrid = {
        liquidacionId: liq.liquidacionId,
        sot: liq.sot,
        tecnico: liq.nombreTecnico,
        tipoOrden: liq.tipoOrden,
        fechaProgramacion: liq.fechaProgramacion,
        subTipoOrden: liq.nombreSubTipoOrden,
        total: liq.precioTotalEditable,
        estadoSistema: liq.estadoSistema,   // para no pisar el estado al editar
        esRegistroExistente: true, // Crítico para que el AutoSave sepa que debe hacer PUT
        detallesIds: {},
      };

      // Desempaquetar arreglo de detalles a columnas sueltas
      if (liq.detallesLiquidacion && liq.detallesLiquidacion.length > 0) {
        liq.detallesLiquidacion.forEach((detalle: any) => {
          const concepto = detalle.concepto?.toUpperCase();
          if (concepto) filaPlana.detallesIds![concepto] = detalle.detalleLiquidacionId;   // para que editar no duplique
          if (concepto === 'COSTO DE SERVICIO') filaPlana.costoServicio = detalle.precioTotal;
          if (concepto === 'DECO') filaPlana.deco = detalle.cantidad;
          if (concepto === 'REPETIDOR') filaPlana.repetidor = detalle.cantidad;
          if (concepto === 'DROP 150') filaPlana.drop150 = detalle.cantidad;
          if (concepto === 'DROP 220') filaPlana.drop220 = detalle.cantidad;
          if (concepto === 'DROP 300') filaPlana.drop300 = detalle.cantidad;
        });
      }

      return filaPlana;
    });
  };

  // Al llegar datos del servidor: servidor + filas nuevas a medio llenar (sin SOT o que aún no se guardaron) + relleno.
  // Así, guardar una fila no borra lo que se estaba escribiendo en otra.
  useEffect(() => {
    if (isLoading) return;
    const servidor = aplanarDatos(liquidaciones);
    const sotsServidor = new Set(servidor.map((f) => f.sot));

    setGridData((prev) => {
      const pendientes = prev.filter((f) => esFilaPendiente(f) && !sotsServidor.has(Number(f.sot)));
      const relleno = Math.max(0, MAX_FILAS_EXCEL - servidor.length - pendientes.length);
      return [...servidor, ...pendientes, ...Array.from({ length: relleno }, () => ({}))];
    });
  }, [liquidaciones, isLoading]);

  const columns = useMemo(() => getLiquidacionesColumns(onDelete), [onDelete]);

  // Edición simple → detail.model (1 fila) | Pegado o autollenado → detail.models + detail.data (varias filas)
  const handleAfterEdit = async (e: CustomEvent) => {
    const d = e.detail;
    const filas: Partial<FilaLiquidacionGrid>[] = d.models
      ? Object.keys(d.models).map((i) => ({ ...d.models[i], ...d.data?.[i] }))   // fila completa + valores pegados
      : [d.model];

    await onAutoSave(filas.filter(Boolean));
  };

  return (
    <DataTable
      titulo="Control de Liquidaciones"
      cantidad={liquidaciones.length}
      pie={pie}
      acciones={<div className="flex items-center gap-2">{accionesExtras}</div>}
    >
      <div className="relative w-full overflow-x-auto border border-gray-200 rounded-md">
        <div className="min-w-[850px] w-full" style={{ height: 'calc(100vh - 300px)', minHeight: '400px', maxHeight: '600px' }}>
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <span className="text-gray-500 font-medium text-sm">Cargando liquidaciones...</span>
            </div>
          )}

          <RevoGrid
            range = {true}
            ref = {gridRef}
            columns={columns}
            editors={gridEditors}
            source={gridData}
            theme={temaClaro.name}
            rowSize={45}
            onAfteredit={handleAfterEdit}
            resize={true}
            useClipboard={true}
          />
        </div>
      </div>
    </DataTable>
  );
};