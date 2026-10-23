import React, { useState } from 'react';
import { Drawer } from '../shared/Drawer';
import { Rol } from '../../types/usuario.types';
import type { UsuarioFilterState } from '../../types/usuario.types';

  interface UsuariosFilterDrawerProps {
      isOpen: boolean;
      onClose: () => void;
      onApply: (search: string, rol: Rol | '') => void;
      onReset: () => void;
  }
  
  const INITIAL_FILTERS: UsuarioFilterState = {
    nombreCompleto: '',
    documentoIdentidad: '',
    rol: '',
  };
  
  export const UsuariosFilterDrawer = ({
    isOpen,
    onClose,
    onApply,
    onReset,
  }: UsuariosFilterDrawerProps) => {
    const [filters, setFilters] = useState<UsuarioFilterState>(INITIAL_FILTERS);
  
    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setFilters((prev) => ({ ...prev, [name]: value }));
    };
  
    const handleApply = () => {
      const busquedaTexto = filters.nombreCompleto.trim() || filters.documentoIdentidad.trim();
      onApply(busquedaTexto, filters.rol);
      onClose();
    };
  
    const handleReset = () => {
      setFilters(INITIAL_FILTERS);
      onReset();
      onClose();
    };
  
    return (
      <Drawer isOpen={isOpen} onClose={onClose} title="Filtrar Usuarios">
        <div className="flex flex-col gap-5">
          {/* Filtro por Nombre Completo */}
          <div>
            <label htmlFor="nombreCompleto" className="block text-sm font-medium text-ink mb-1">
              Nombre Completo
            </label>
            <input
              id="nombreCompleto"
              type="text"
              name="nombreCompleto"
              value={filters.nombreCompleto}
              onChange={handleChange}
              placeholder="Buscar por nombre..."
              className="w-full px-3 py-2 border border-line rounded-control text-sm focus:outline-none focus:ring-2 focus:ring-danger"
            />
          </div>
  
          {/* Filtro por Documento de Identidad */}
          <div>
            <label htmlFor="documentoIdentidad" className="block text-sm font-medium text-ink mb-1">
              Documento de Identidad
            </label>
            <input
              id="documentoIdentidad"
              type="text"
              name="documentoIdentidad"
              value={filters.documentoIdentidad}
              onChange={handleChange}
              placeholder="DNI o Cédula..."
              className="w-full px-3 py-2 border border-line rounded-control text-sm focus:outline-none focus:ring-2 focus:ring-danger"
            />
          </div>
  
          {/* Filtro por Rol */}
          <div>
            <label htmlFor="rol" className="block text-sm font-medium text-ink mb-1">
              Rol
            </label>
            <select
              id="rol"
              name="rol"
              value={filters.rol}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-line rounded-control text-sm focus:outline-none focus:ring-2 focus:ring-danger"
            >
              <option value="">Todos los roles</option>
              {Object.values(Rol).map((rolOption) => (
                <option key={rolOption} value={rolOption}>
                  {rolOption}
                </option>
              ))}
            </select>
          </div>
        </div>
  
        {/* Acciones de pie de página */}
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="w-1/2 inline-flex h-10 items-center justify-center gap-2 rounded-pill border border-line bg-surface px-5 text-sm font-medium text-ink transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="w-1/2 inline-flex h-10 items-center justify-center gap-2 rounded-pill bg-brand px-5 text-sm font-semibold text-on-primary transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Aplicar Filtros
          </button>
        </div>
      </Drawer>
    );
  };