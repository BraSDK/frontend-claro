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
          <label className="block text-sm font-medium text-ink mb-1">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={filters.nombre}
            onChange={handleChange}
            placeholder="Buscar por nombre..."
            className="w-full px-3 py-2 border border-line rounded-control text-sm focus:outline-none focus:ring-2 focus:ring-danger"
          />
        </div>

        {/* Filtro por Rango de Precio */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Precio</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="precioMin"
              value={filters.precioMin}
              onChange={handleChange}
              placeholder="Mín."
              className="w-1/2 px-3 py-2 border border-line rounded-control text-sm focus:outline-none focus:ring-2 focus:ring-danger"
            />
            <input
              type="number"
              name="precioMax"
              value={filters.precioMax}
              onChange={handleChange}
              placeholder="Máx."
              className="w-1/2 px-3 py-2 border border-line rounded-control text-sm focus:outline-none focus:ring-2 focus:ring-danger"
            />
          </div>
        </div>

        {/* Filtro por Estado (Valores fijos) */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Estado</label>
          <select
            name="estado"
            value={filters.estado}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-line rounded-control text-sm focus:outline-none focus:ring-2 focus:ring-danger"
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
          className="w-1/2 inline-flex h-10 items-center justify-center gap-2 rounded-pill border border-line bg-surface px-5 text-sm font-medium text-ink transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Limpiar
        </button>
        <button
          onClick={handleApply}
          className="w-1/2 inline-flex h-10 items-center justify-center gap-2 rounded-pill bg-brand px-5 text-sm font-semibold text-on-primary transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Aplicar Filtros
        </button>
      </div>
    </Drawer>
  );
};