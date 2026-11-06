import React, { useState, useEffect, useMemo,useRef } from 'react';
import { RevoGrid } from '@revolist/react-datagrid';
import { temaClaro } from '@/theme/revogrid-theme';
import type { ListarRequestLiquidacionesDto, FilaLiquidacionGrid } from '../../types/liquidacion.types';
import { getLiquidacionesColumns, gridEditors } from './liquidacionesColumns';
import { calcularTotal, type PreciosAdicionales } from '../../utils/liquidacion.mapper';

const MAX_FILAS_EXCEL = 200;

interface LiquidacionesTableProps {
  liquidaciones: ListarRequestLiquidacionesDto[];
  isLoading: boolean;
  onAutoSave: (filas: Partial<FilaLiquidacionGrid>[]) => Promise<void>;   // 1 fila (edición) o varias (pegado/autollenado)
  onDelete?: (sot: number) => void;
  precios: PreciosAdicionales;   // precios del catálogo para calcular el total al editar
  onAprobarImportacion?: (sot: number) => void;
  onRechazarImportacion?: (sot: number) => void;
}

// Fila nueva que el usuario ya empezó a llenar (todavía no está en el servidor)
const esFilaPendiente = (f: Partial<FilaLiquidacionGrid>) =>
  !f.esRegistroExistente && Object.values(f).some((v) => v !== undefined && v !== null && v !== '');

export const LiquidacionesTable: React.FC<LiquidacionesTableProps> = ({
  liquidaciones,
  isLoading,
  onAutoSave,
  onDelete,
  precios,
  onAprobarImportacion,     
  onRechazarImportacion,
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
        total: liq.precioTotalReal ?? undefined,       // el que guardó el back
        precioTotalEditable: liq.precioTotalEditable,
        estadoSistema: liq.estadoSistema,   // para no pisar el estado al editar
        esRegistroExistente: true, // Crítico para que el AutoSave sepa que debe hacer PUT
        detallesIds: {},
        observacionesIds: {},
      };

      // Observaciones: una columna por tipo (FOTOS = 0, SI_PAGO = 1, NO_PAGO = 2)
      (liq.observaciones ?? []).forEach((o) => {
        filaPlana.observacionesIds![o.tipo] = o.observacionLiquidacionId;
        if (o.tipo === 0) filaPlana.obsFotos = o.texto ?? '';
        if (o.tipo === 1) filaPlana.obsSiPago = o.texto ?? '';
        if (o.tipo === 2) filaPlana.obsNoPago = o.texto ?? '';
      });

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
    const servidor = aplanarDatos(liquidaciones).map((fila) => ({
      ...fila,
      miClaseFila: fila.estadoSistema === 3
        ? 'bg-amber-50 text-amber-900 border-l-4 border-amber-400' // Importada (Pendiente)
        : fila.estadoSistema === 4 
          ? 'bg-red-50 text-red-900 opacity-75'                    // Rechazada
          : '', //Normal
    }));
    const sotsServidor = new Set(servidor.map((f) => f.sot));

    setGridData((prev) => {
      const pendientes = prev.filter((f) => esFilaPendiente(f) && !sotsServidor.has(Number(f.sot)));
      const relleno = Math.max(0, MAX_FILAS_EXCEL - servidor.length - pendientes.length);
      return [...servidor, ...pendientes, ...Array.from({ length: relleno }, () => ({}))];
    });
  }, [liquidaciones, isLoading]);

  const columns = useMemo(() => getLiquidacionesColumns(onDelete, onAprobarImportacion, onRechazarImportacion, precios), [onDelete, onAprobarImportacion, onRechazarImportacion, precios]);

  // Edición simple → detail.model (1 fila) | Pegado o autollenado → detail.models + detail.data (varias filas)
  const handleAfterEdit = async (e: CustomEvent) => {
    const d = e.detail;
    const modelos: Partial<FilaLiquidacionGrid>[] = d.models
      ? Object.keys(d.models).map((i) => Object.assign(d.models[i], d.data?.[i]))   // fila completa + valores pegados
      : [d.model];

    // el total se ve al instante, sin esperar al guardado (el back lo vuelve a calcular igual)
    modelos.filter(Boolean).forEach((m) => { m.total = calcularTotal(m, precios) || undefined; });
    setGridData((prev) => [...prev]);

    await onAutoSave(modelos.filter(Boolean));
  };

  // Solo la hoja: ocupa todo el alto del contenedor que le dé la página (la barra de herramientas y la paginación van en la página)
  return (
    <div className="grilla-excel relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
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
        rowSize={34}
        rowHeaders={true}   // números de fila a la izquierda, como en Excel
        onAfteredit={handleAfterEdit}
        resize={true}
        useClipboard={true}
        rowClass="miClaseFila"
      />
    </div>
  );
};
