import React, { useState } from 'react';
import { Drawer } from '../shared/Drawer';

export interface FilterState {
  nombre: string;
  precioMin: string;
  precioMax: string;
  estado: string;
}

interface ServiciosFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  onResetFilters: () => void;
}

export const ServiciosFilterDrawer = ({
  isOpen,
  onClose,
  onApplyFilters,
  onResetFilters,
}: ServiciosFilterDrawerProps) => {
  const [filters, setFilters] = useState<FilterState>({
    nombre: '',
    precioMin: '',
    precioMax: '',
    estado: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const initialValues = { nombre: '', precioMin: '', precioMax: '', estado: '' };
    setFilters(initialValues);
    onResetFilters();
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Filtrar Servicios">
      <div className="flex flex-col gap-5">
        {/* Filtro por Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={filters.nombre}
            onChange={handleChange}
            placeholder="Buscar por nombre..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Filtro por Rango de Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="precioMin"
              value={filters.precioMin}
              onChange={handleChange}
              placeholder="Mín."
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="number"
              name="precioMax"
              value={filters.precioMax}
              onChange={handleChange}
              placeholder="Máx."
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Filtro por Estado (Valores fijos) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            name="estado"
            value={filters.estado}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Todos los estados</option>
            <option value="HFC">HFC</option>
            <option value="FTH">FTH</option>
            <option value="MANTTO">Mantenimiento</option>
          </select>
        </div>
      </div>

      {/* Acciones de pie de página */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={handleReset}
          className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition-colors text-sm"
        >
          Limpiar
        </button>
        <button
          onClick={handleApply}
          className="w-1/2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium transition-colors text-sm"
        >
          Aplicar Filtros
        </button>
      </div>
    </Drawer>
  );
};