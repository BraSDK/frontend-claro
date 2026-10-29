import React from 'react';
import { Drawer } from '@/components/shared/Drawer';
import type { ListarRequestLiquidacionesDto } from '../../types/liquidacion.types';

interface LiquidacionFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  liquidacion?: ListarRequestLiquidacionesDto | null;
}

export const LiquidacionFormDrawer: React.FC<LiquidacionFormDrawerProps> = ({
  isOpen,
  onClose,
  liquidacion
}) => {
  return (
    <Drawer 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Detalles de Liquidación ${liquidacion?.sot ? `- SOT: ${liquidacion.sot}` : ''}`}
      widthClass="w-[900px]" // Extra ancho para acomodar la grilla de conceptos cómodamente
      footer={
        <div className="flex items-center justify-end">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      }
    >
      {liquidacion ? (
        <div className="flex flex-col gap-5 h-full">
          {/* Cabecera de solo lectura con contexto */}
          <div className="flex flex-wrap gap-x-8 gap-y-2 p-4 bg-gray-50 border border-gray-200 rounded-md text-sm">
            <div><span className="font-semibold text-gray-700">SOT:</span> {liquidacion.sot}</div>
            <div><span className="font-semibold text-gray-700">SubTipo:</span> {liquidacion.nombreSubTipoOrden}</div>
            <div><span className="font-semibold text-gray-700">Técnico:</span> {liquidacion.nombreTecnico || 'Sin asignar'}</div>
            <div>
              <span className="font-semibold text-gray-700">Total Editable:</span> 
              <span className="ml-1 text-green-600 font-bold">
                {liquidacion.precioTotalEditable ? `S/ ${liquidacion.precioTotalEditable.toFixed(2)}` : 'S/ 0.00'}
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Conceptos de la Orden</h3>
            <p className="text-xs text-gray-500 mb-3">
              Edita las celdas para autoguardar los materiales y baremos de esta liquidación.
            </p>
            
            {/* AQUÍ INYECTAREMOS EL NUEVO REVOGRID DE DETALLES */}
            <div className="flex-1 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 rounded-md bg-gray-50 min-h-[400px]">
              [Próximo paso: Componente DetallesTable con RevoGrid]
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-10">
          No se ha seleccionado ninguna liquidación válida.
        </div>
      )}
    </Drawer>
  );
};