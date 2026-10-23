import { useState, useEffect } from 'react';
import { Filter, UserPlus } from 'lucide-react';
import { useModal } from '../hooks/useModal';
import { Modal } from '../components/shared/Modal';

import { useUsuarios } from '../hooks/usuario/useUsuarios';
import { useUsuariosFilter } from '../hooks/usuario/useUsuariosFilter';
import { UsuariosTable } from '../components/Usuarios/UsuariosTable';
import { UsuarioForm } from '../components/Usuarios/UsuarioForm';
import { UsuariosFilterDrawer } from '../components/Usuarios/UsuariosFilterDrawer';

import type { Usuario, RegisterRequestDto, EditRequestDto } from '../types/usuario.types';
import { Rol } from '../types/usuario.types';

export const UsuariosPage = () => {
  const { 
    usuarios, 
    isLoading, 
    error, 
    addUsuario, 
    editUsuario, 
    removeUsuario 
  } = useUsuarios();

  const {
    isOpen,
    itemToEdit,
    openForCreate,
    openForEdit,
    closeModal,
  } = useModal<Usuario>();

  const {
    isFilterOpen,
    usuariosFiltrados,
    openFilter,
    closeFilter,
    applyFilters,
    resetFilters,
  } = useUsuariosFilter(usuarios);

  // Rol del usuario en sesión extraído de claims/token o storage
  const [rolLogueado, setRolLogueado] = useState<string | null>(null);

  useEffect(() => {
    const rolActual = localStorage.getItem('user_role') || Rol.ADMIN;
    setRolLogueado(rolActual);
  }, []);

  const handleGuardarUsuario = async (datosFormulario: RegisterRequestDto | EditRequestDto) => {
    try {
      if (itemToEdit) {
        await editUsuario({
          ...datosFormulario,
          id: itemToEdit.id,
        });
      } else {
        await addUsuario(datosFormulario as RegisterRequestDto);
      }
      closeModal();
    } catch (err) {
      console.error('Fallo al guardar el usuario:', err);
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
    <div className="flex flex-col gap-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Gestión de Usuarios</h1>
          <p className="text-sm text-label mt-1">
            Administra los roles, identidades y accesos del personal
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Botón Filtros */}
          <button
            type="button"
            onClick={openFilter}
            className="bg-page hover:bg-line text-ink px-4 py-2.5 rounded-control text-sm font-medium transition-colors flex items-center gap-2 border border-line"
          >
            <Filter size={16} />
            Filtros
          </button>

          {/* Botón Nuevo Usuario (Exclusivo para ADMIN según autorización) */}
          {rolLogueado === Rol.ADMIN && (
            <button
              type="button"
              onClick={openForCreate}
              className="inline-flex h-[30px] items-center justify-center gap-1.5 rounded-control bg-primary px-3 text-sm font-bold text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus size={16} />
              Nuevo Usuario
            </button>
          )}
        </div>
      </div>

      {/* Alerta de error */}
      {error && (
        <div className="p-4 bg-danger-soft text-danger rounded-control border border-danger/30 text-sm">
          {error}
        </div>
      )}

      {/* Contenedor de la Tabla con datos filtrados */}
      <div className="bg-surface rounded-card border border-line overflow-hidden">
        <UsuariosTable
          usuarios={usuariosFiltrados}
          isLoading={isLoading}
          onEdit={openForEdit}
          onDelete={handleEliminarUsuario}
          rolLogueado={rolLogueado}
        />
      </div>

      {/* Drawer lateral de Filtros */}
      {isFilterOpen && (
        <UsuariosFilterDrawer
          isOpen={isFilterOpen}
          onClose={closeFilter}
          onApply={applyFilters}
          onReset={resetFilters}
        />
      )}

      {/* Modal Reutilizable para Registro y Edición */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title={itemToEdit ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
      >
        {isOpen && (
          <UsuarioForm
            initialData={itemToEdit}
            onSubmit={handleGuardarUsuario}
            onCancel={closeModal}
            rolLogueado={rolLogueado}
          />
        )}
      </Modal>
    </div>
  );
};