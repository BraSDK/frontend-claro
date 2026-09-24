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
            <label htmlFor="nombreCompleto" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            <input
              id="nombreCompleto"
              type="text"
              name="nombreCompleto"
              value={filters.nombreCompleto}
              onChange={handleChange}
              placeholder="Buscar por nombre..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
  
          {/* Filtro por Documento de Identidad */}
          <div>
            <label htmlFor="documentoIdentidad" className="block text-sm font-medium text-gray-700 mb-1">
              Documento de Identidad
            </label>
            <input
              id="documentoIdentidad"
              type="text"
              name="documentoIdentidad"
              value={filters.documentoIdentidad}
              onChange={handleChange}
              placeholder="DNI o Cédula..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
  
          {/* Filtro por Rol */}
          <div>
            <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              id="rol"
              name="rol"
              value={filters.rol}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
            className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="w-1/2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            Aplicar Filtros
          </button>
        </div>
      </Drawer>
    );
  };