import React, { useState, useEffect, useMemo } from 'react';
import { RevoGrid } from '@revolist/react-datagrid';
import { temaClaro } from '@/theme/revogrid-theme';
import { DataTable } from '@/components/shared/Tabla';
import { RotateCcw } from 'lucide-react';
import type { ListarRequestLiquidacionesDto, FilaLiquidacionGrid } from '../../types/liquidacion.types';
import { getLiquidacionesColumns } from './liquidacionesColumns';

const MAX_FILAS_EXCEL = 200;
const DRAFT_STORAGE_KEY = 'liquidaciones_grid_draft_auto_v1';

// Actualizamos Props para incluir onAutoSave
interface LiquidacionesTableProps {
  liquidaciones: ListarRequestLiquidacionesDto[];
  isLoading: boolean;
  onAutoSave: (filaEditada: Partial<FilaLiquidacionGrid>) => Promise<void>;
  onDelete?: (sot: number) => void;
  onRefresh: () => Promise<void>;
  accionesExtras?: React.ReactNode;
  pie?: React.ReactNode;
}

export const LiquidacionesTable: React.FC<LiquidacionesTableProps> = ({ 
  liquidaciones, 
  isLoading, 
  onAutoSave, 
  onDelete,
  onRefresh,
  accionesExtras,
  pie
}) => {
  const [gridData, setGridData] = useState<Partial<FilaLiquidacionGrid>[]>([]);
  const [hayBorrador, setHayBorrador] = useState(false);

  // Función traductora: APLANA el JSON anidado del backend hacia columnas planas
  const aplanarDatos = (datosServidor: ListarRequestLiquidacionesDto[]): FilaLiquidacionGrid[] => {
    return datosServidor.map(liq => {
      const filaPlana: FilaLiquidacionGrid = {
        sot: liq.sot,
        tecnico: liq.nombreTecnico,
        tipoOrden: liq.tipoOrden,
        fechaProgramacion: liq.fechaProgramacion,
        subTipoOrden: liq.nombreSubTipoOrden,
        total: liq.precioTotalEditable,
        esRegistroExistente: true // Crítico para que el AutoSave sepa que debe hacer PUT
      };

      // Desempaquetar arreglo de detalles a columnas sueltas
      if (liq.detallesLiquidacion && liq.detallesLiquidacion.length > 0) {
        liq.detallesLiquidacion.forEach((detalle: any) => {
          const concepto = detalle.concepto?.toUpperCase();
          if (concepto === 'COSTO DE SERVICIO') filaPlana.costoServicio = detalle.precioTotal;
          if (concepto === 'DECO') filaPlana.deco = detalle.cantidad;
          if (concepto === 'REPETIDOR') filaPlana.repetidor = detalle.cantidad;
          if (concepto === 'DROP 150') filaPlana.drop150 = detalle.cantidad;
          if (concepto === 'DROP 220') filaPlana.drop220 = detalle.cantidad;
          if (concepto === 'DROP 300') filaPlana.drop300 = detalle.cantidad;
        });
      }

      // Si tu backend enviara observaciones en el GET, se desempaquetarían aquí
      // liq.observaciones?.forEach(...)

      return filaPlana;
    });
  };

  const restablecerDesdeServidor = (datosServidor: ListarRequestLiquidacionesDto[]) => {
    const datosAplanados = aplanarDatos(datosServidor);
    const filasVaciasNecesarias = Math.max(0, MAX_FILAS_EXCEL - datosServidor.length);
    const arrayVacio: Partial<FilaLiquidacionGrid>[] = Array.from({ length: filasVaciasNecesarias }).map(() => ({}));

    setGridData([...datosAplanados, ...arrayVacio]);
    setHayBorrador(false);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  useEffect(() => {
    if (isLoading) return;

    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft) as Partial<ListarRequestLiquidacionesDto>[];
        if (Array.isArray(parsedDraft) && parsedDraft.length > 0) {
          setGridData(parsedDraft);
          setHayBorrador(true);
          return;
        }
      } catch (e) {
        console.error("Error al recuperar borrador local:", e);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    }

    restablecerDesdeServidor(liquidaciones);
  }, [liquidaciones, isLoading]);

  const columns = useMemo(() => getLiquidacionesColumns(onDelete), [onDelete]);

  const handleAfterEdit = async (e: CustomEvent) => {
    // 1. Guardar en memoria local al instante
    setHayBorrador(true);
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(gridData));
    
    // 2. Ejecutar el autoguardado hacia la API
    const filaEditada = e.detail.model as Partial<FilaLiquidacionGrid>;
    await onAutoSave(filaEditada);

    // Refrescar la lista desde el backend
    if (onRefresh) {
      await onRefresh();
    }
  };

  const descartarBorrador = () => {
    const confirmar = window.confirm('¿Deseas limpiar la memoria local y recargar los datos originales?');
    if (confirmar) {
      restablecerDesdeServidor(liquidaciones);
    }
  };

  return (
    <DataTable
      titulo="Control de Liquidaciones"
      cantidad={liquidaciones.length}
      pie={pie}
      acciones={
        <div className="flex items-center gap-2">
          {hayBorrador && (
            <button
              type="button"
              onClick={descartarBorrador}
              className="inline-flex h-[32px] items-center gap-1.5 rounded-md px-3 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              title="Descartar ediciones incompletas en memoria"
            >
              <RotateCcw size={14} /> Descartar borrador local
            </button>
          )}
          {accionesExtras} 
        </div>
      }
    >
      <div className="relative w-full overflow-x-auto border border-gray-200 rounded-md">
        <div className="min-w-[850px] w-full" style={{ height: 'calc(100vh - 300px)', minHeight: '400px', maxHeight: '600px' }}>
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <span className="text-gray-500 font-medium text-sm">Cargando liquidaciones...</span>
            </div>
          )}

          <RevoGrid
            columns={columns}
            source={gridData}
            theme={temaClaro.name}
            rowSize={45}
            onAfteredit={handleAfterEdit}
            resize={true}
          />
        </div>
      </div>
    </DataTable>
  );
};