import React, { useMemo } from 'react';
import { RevoGrid } from '@revolist/react-datagrid';
import { temaClaro } from '@/theme/revogrid-theme';
import { DataTable } from '@/components/shared/Tabla'; // Ajusta la ruta
import type { Usuario } from '../../types/usuario.types';
import { Rol } from '../../types/usuario.types';
import type { ColumnRegular } from '@revolist/react-datagrid';

interface Props {
  usuarios: Usuario[];
  isLoading: boolean;
  onEdit: (usuario: Usuario) => void;
  onDelete: (id: number) => void;
  rolLogueado?: string | null;
}

export const UsuariosTable = ({
  usuarios,
  isLoading,
  onEdit,
  onDelete,
  rolLogueado
}: Props) => {

  // Definimos las columnas para RevoGrid
  const columns = useMemo<ColumnRegular[]>(() => [
    { prop: 'id', name: 'ID', size: 80, readonly: true },
    { prop: 'nombreCompleto', name: 'Nombre Completo', size: 250, readonly: true },
    { prop: 'documentoIdentidad', name: 'Documento', size: 150, readonly: true },
    { prop: 'email', name: 'Email', size: 250, readonly: true },
    { 
      prop: 'rol', 
      name: 'Rol', 
      size: 150,
      readonly: true,
      // Template para el Badge del Rol
      cellTemplate: (h: any, props: any) => {
        const rol = props.model[props.prop];
        let bgClass = 'bg-gray-100 text-gray-700';
        
        if (rol === Rol.ADMIN) bgClass = 'bg-purple-100 text-purple-700';
        else if (rol === Rol.TECNICO) bgClass = 'bg-blue-100 text-blue-700';
        else if (rol === Rol.ALMACEN) bgClass = 'bg-amber-100 text-amber-700';

        return h('span', { 
          class: `px-3 py-1 text-xs font-medium rounded-full inline-block mt-1.5 ${bgClass}` 
        }, rol);
      }
    },
    {
      prop: 'acciones',
      name: 'Acciones',
      size: 120,
      pin: 'colPinEnd', // Fija la columna a la derecha
      readonly: true,
      // Template para los botones de acción
      cellTemplate: (h: any, props: any) => {
        const usuario = props.model as Usuario;
        
        const btnEdit = h('button', {
          class: 'p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors',
          title: 'Editar',
          onClick: () => onEdit(usuario)
        }, '✎'); // Usamos el símbolo unicode para evitar problemas de renderizado de iconos React dentro del Canvas

        const botones = [btnEdit];

        // Validamos si tiene permisos para eliminar
        if (rolLogueado === Rol.ADMIN) {
          const btnDelete = h('button', {
            class: 'p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-2',
            title: 'Eliminar',
            onClick: () => onDelete(usuario.id)
          }, '🗑');
          botones.push(btnDelete);
        }

        return h('div', { class: 'flex items-center justify-end gap-2 w-full h-full pr-4' }, botones);
      }
    }
  ], [onEdit, onDelete, rolLogueado]);

  return (
    <DataTable
      titulo="Usuarios Registrados"
      cantidad={usuarios.length}
      // Si necesitas acciones globales (ej: botón "Nuevo Usuario"), irían aquí
      acciones={<></>} 
    >
      <div className="relative w-full border border-gray-200 rounded-md overflow-hidden" style={{ height: '500px' }}>
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <span className="text-gray-500 font-medium">Cargando datos...</span>
          </div>
        )}
        
        {!isLoading && usuarios.length === 0 ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white">
            <span className="text-gray-500">No hay usuarios registrados.</span>
          </div>
        ) : (
          <RevoGrid
            columns={columns}
            source={usuarios}
            theme={temaClaro.name}
            rowSize={45} // Filas un poco más altas para acomodar los badges
          />
        )}
      </div>
    </DataTable>
  );
};