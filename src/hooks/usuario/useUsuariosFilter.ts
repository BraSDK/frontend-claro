import { useState, useMemo } from 'react';
import type { Usuario, Rol } from '../../types/usuario.types';

export const useUsuariosFilter = (usuarios: Usuario[] = []) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rolFilter, setRolFilter] = useState<Rol | ''>('');

  const openFilter = () => setIsFilterOpen(true);
  const closeFilter = () => setIsFilterOpen(false);

  const applyFilters = (search: string, rol: Rol | '') => {
    setSearchQuery(search);
    setRolFilter(rol);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setRolFilter('');
  };

  const usuariosFiltrados = useMemo(() => {
    // Protección contra valores no iterables
    if (!Array.isArray(usuarios)) return [];

    const query = searchQuery.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      // Protección contra valores nulos o indefinidos en cada campo
      const nombre = (usuario?.nombreCompleto ?? '').toLowerCase();
      const documento = (usuario?.documentoIdentidad ?? '').toLowerCase();
      const email = (usuario?.email ?? '').toLowerCase();

      const coincideNombreODocumento =
        !query ||
        nombre.includes(query) ||
        documento.includes(query) ||
        email.includes(query);

      const coincideRol = rolFilter ? usuario.rol === rolFilter : true;

      return coincideNombreODocumento && coincideRol;
    });
  }, [usuarios, searchQuery, rolFilter]);

  return {
    isFilterOpen,
    usuariosFiltrados,
    openFilter,
    closeFilter,
    applyFilters,
    resetFilters,
  };
};