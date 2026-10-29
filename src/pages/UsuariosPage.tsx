import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';

import { useUsuarios } from '../hooks/usuario/useUsuarios';
import { useUsuariosFilter } from '../hooks/usuario/useUsuariosFilter';
import { UsuariosTable } from '../components/Usuarios/UsuariosTable';
import { UsuariosFilterDrawer } from '../components/Usuarios/UsuariosFilterDrawer';

import type { Usuario, RegisterRequestDto, EditRequestDto } from '../types/usuario.types';
import { Rol } from '../types/usuario.types';

// Mapa auxiliar para el backend
const RolBackendMap: Record<string, number> = {
  ADMIN: 0,
  TECNICO: 1,
  ALMACEN: 2,
};

export const UsuariosPage = () => {
  const { 
    usuarios, 
    isLoading, 
    error, 
    addUsuario, 
    editUsuario, 
    removeUsuario 
    // fetchUsuarios // <- Ideal si tu hook expone la función de recarga
  } = useUsuarios();

  const {
    isFilterOpen,
    usuariosFiltrados,
    openFilter,
    closeFilter,
    applyFilters,
    resetFilters,
  } = useUsuariosFilter(usuarios);

  const [rolLogueado, setRolLogueado] = useState<string | null>(null);

  useEffect(() => {
    const rolActual = localStorage.getItem('user_role') || Rol.ADMIN;
    setRolLogueado(rolActual);
  }, []);

  // Lógica de Autoguardado por fila (Se dispara al salir de la celda)
  const handleAutoSave = async (fila: Partial<Usuario>) => {
    try {
      const rolParaApi = typeof fila.rol === 'number' 
        ? fila.rol 
        : RolBackendMap[fila.rol as string] ?? 2;

      if (fila.id) {
        // EDICIÓN: El registro ya existe, actualizamos inmediatamente
        await editUsuario({
          id: fila.id,
          nombreCompleto: fila.nombreCompleto || '',
          documentoIdentidad: fila.documentoIdentidad || '',
          email: fila.email || '',
          rol: rolParaApi as unknown as Rol
        } as EditRequestDto);
      } else {
        // CREACIÓN: Validamos que estén todos los campos mínimos antes de hacer POST
        const estaCompleta = fila.nombreCompleto?.trim() && 
                             fila.documentoIdentidad?.trim() && 
                             fila.email?.trim() && 
                             fila.rol;

        if (estaCompleta) {
          await addUsuario({
            nombreCompleto: fila.nombreCompleto!,
            documentoIdentidad: fila.documentoIdentidad!,
            email: fila.email!,
            rol: rolParaApi as unknown as Rol,
            password: 'User123!' // Clave por defecto
          } as RegisterRequestDto);
          
          // IMPORTANTE: Recargar datos para que la nueva fila reciba su 'id' real
          // if (fetchUsuarios) fetchUsuarios(); 
        }
      }
    } catch (err) {
      console.error('Fallo en el autoguardado:', err);
    }
  };

  const handleEliminarUsuario = async (id: number) => {
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar este usuario?');
    if (confirmar) {
      try {
        await removeUsuario(id);
      } catch (err) {
        console.error('Fallo al eliminar el usuario:', err);
      }
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra los roles, identidades y accesos del personal
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={openFilter}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Filter size={16} /> Filtros
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Componente Tabla (Ahora utiliza onAutoSave) */}
      <UsuariosTable
        usuarios={usuariosFiltrados}
        isLoading={isLoading}
        onAutoSave={handleAutoSave}
        onDelete={handleEliminarUsuario}
        rolLogueado={rolLogueado}
      />

      <UsuariosFilterDrawer 
        isOpen={isFilterOpen}
        onClose={closeFilter}
        onApply={applyFilters}
        onReset={resetFilters}
      />
    </div>
  );
};