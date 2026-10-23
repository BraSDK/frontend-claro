import React, { useState, useEffect } from 'react';
import { Drawer } from '@/components/shared/Drawer';
import { Campo, Entrada, Selector } from '@/components/shared/Filtros';
import { Boton } from '@/components/shared/Tabla';
import type { CrearLiquidacionRequest, EditarLiquidacionRequestDto } from '../../types/liquidacion.types';

interface LiquidacionFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  liquidacionToEdit?: EditarLiquidacionRequestDto | null;
  onSubmit: (data: any) => Promise<void>;
}

export const LiquidacionFormDrawer: React.FC<LiquidacionFormDrawerProps> = ({
  isOpen,
  onClose,
  liquidacionToEdit,
  onSubmit
}) => {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<CrearLiquidacionRequest>>({
    sot: 0,
    nombreSubTipoOrden: '',
    nombreTecnico: '',
    fechaProgramacion: new Date().toISOString().split('T')[0],
    estadoSistema: 1,
    detalles: []
  });

  useEffect(() => {
    if (liquidacionToEdit) {
      setFormData({
        sot: liquidacionToEdit.sot,
        nombreSubTipoOrden: liquidacionToEdit.nombreSubTipoOrden,
        nombreTecnico: liquidacionToEdit.nombreTecnico,
        // Adaptar fecha u otros campos según necesites
      });
    } else {
      setFormData({
        sot: 0,
        nombreSubTipoOrden: '',
        nombreTecnico: '',
        fechaProgramacion: new Date().toISOString().split('T')[0],
        estadoSistema: 1,
      });
    }
  }, [liquidacionToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer 
      isOpen={isOpen} 
      onClose={onClose} 
      title={liquidacionToEdit ? 'Editar Liquidación' : 'Nueva Liquidación'}
      widthClass="w-[600px]" // Más ancho para acomodar la tabla de detalles cómodamente
      footer={
        <div className="flex items-center justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-ink bg-surface border border-line rounded-control hover:bg-page transition-colors"
          >
            Cancelar
          </button>
          <Boton 
            type="submit" 
            form="liquidacion-form" 
            disabled={loading}
            className="w-auto px-6 py-2" // Sobrescribe el ancho si es necesario
          >
            {loading ? 'Guardando...' : 'Guardar Liquidación'}
          </Boton>
        </div>
      }
    >
      <form id="liquidacion-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Sección de Datos Generales */}
        <section>
          <h3 className="text-sm font-bold text-ink mb-4 border-b pb-2">Datos Principales</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <Campo label="Número SOT">
              <Entrada 
                type="number" 
                name="sot" 
                value={formData.sot || ''} 
                onChange={handleChange} 
                required 
              />
            </Campo>

            <Campo label="SubTipo Orden">
              <Entrada 
                type="text" 
                name="nombreSubTipoOrden" 
                value={formData.nombreSubTipoOrden || ''} 
                onChange={handleChange} 
                required 
              />
            </Campo>

            <Campo label="Técnico">
              <Entrada 
                type="text" 
                name="nombreTecnico" 
                value={formData.nombreTecnico || ''} 
                onChange={handleChange} 
              />
            </Campo>

            <Campo label="Fecha Programación">
              <Entrada 
                type="date" 
                name="fechaProgramacion" 
                value={formData.fechaProgramacion as string || ''} 
                onChange={handleChange} 
                required 
              />
            </Campo>

            <Campo label="Estado">
              <Selector 
                name="estadoSistema" 
                value={formData.estadoSistema || ''} 
                onChange={handleChange}
              >
                <option value={1}>Ingresada</option>
                <option value={2}>Validada</option>
              </Selector>
            </Campo>

          </div>
        </section>

        {/* Sección de Detalles (Aquí irá la tabla de conceptos luego) */}
        <section>
          <h3 className="text-sm font-bold text-ink mb-4 border-b pb-2">Detalles y Conceptos</h3>
          <div className="p-8 text-center text-label border-2 border-dashed border-line rounded-control">
            Aún no hay conceptos agregados a esta liquidación.
          </div>
        </section>

      </form>
    </Drawer>
  );
};