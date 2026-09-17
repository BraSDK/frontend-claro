import { useState, useMemo } from 'react';
import type { Servicio } from '../../types/servicio';

export interface FilterState {
  nombre: string;
  precioMin: string;
  precioMax: string;
  estado: string;
}

const initialFilterState: FilterState = {
  nombre: '',
  precioMin: '',
  precioMax: '',
  estado: '',
};

export const useServiciosFilter = (servicios: Servicio[]) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialFilterState);

  const openFilter = () => setIsFilterOpen(true);
  const closeFilter = () => setIsFilterOpen(false);

  const applyFilters = (filters: FilterState) => {
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    setAppliedFilters(initialFilterState);
  };

  const serviciosFiltrados = useMemo(() => {
    return servicios.filter((servicio) => {
      // Filtro por Nombre
      if (
        appliedFilters.nombre &&
        !servicio.nombre.toLowerCase().includes(appliedFilters.nombre.toLowerCase())
      ) {
        return false;
      }

      // Filtro por Precio Mínimo
      if (
        appliedFilters.precioMin &&
        servicio.precio < Number(appliedFilters.precioMin)
      ) {
        return false;
      }

      // Filtro por Precio Máximo
      if (
        appliedFilters.precioMax &&
        servicio.precio > Number(appliedFilters.precioMax)
      ) {
        return false;
      }

      // Filtro por Estado/Categoría
      if (
        appliedFilters.estado &&
        servicio.categoria !== appliedFilters.estado
      ) {
        return false;
      }

      return true;
    });
  }, [servicios, appliedFilters]);

  return {
    isFilterOpen,
    appliedFilters,
    serviciosFiltrados,
    openFilter,
    closeFilter,
    applyFilters,
    resetFilters,
  };
};