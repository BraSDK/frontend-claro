import { Rol } from '../../types/usuario.types';
import type { Usuario } from '../../types/usuario.types';
import type { ColumnRegular } from '@revolist/react-datagrid';

export const getUsuariosColumns = (
  onDelete: (id: number) => void,
  rolLogueado?: string | null
): ColumnRegular[] => [
  { 
    prop: 'id', 
    name: 'ID', 
    size: 80, 
    readonly: true,
    cellTemplate: (h: any, props: any) => {
      const id = props.model[props.prop];
      return h('span', { class: 'text-gray-400 font-mono text-xs' }, id ? `#${id}` : '-');
    }
  },
  { prop: 'nombreCompleto', name: 'Nombre Completo', size: 250 },
  { prop: 'documentoIdentidad', name: 'Documento', size: 150 },
  { prop: 'email', name: 'Email', size: 250 },
  { 
    prop: 'rol', 
    name: 'Rol', 
    size: 150,
    columnType: 'select', // Convierte la celda en un Dropdown al editar
    source: [Rol.ADMIN, Rol.TECNICO, Rol.ALMACEN], // Las opciones disponibles
    cellTemplate: (h: any, props: any) => {
      const rol = props.model[props.prop] as Rol | undefined;
      if (!rol) return ''; 

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
    size: 80,
    pin: 'colPinEnd',
    readonly: true,
    cellTemplate: (h: any, props: any) => {
      const usuario = props.model as Partial<Usuario>;
      
      // Si la fila no tiene ID (es una de las 200 filas vacías de relleno), no mostramos botón de eliminar
      if (!usuario.id) return '';

      const botones = [];
      if (rolLogueado === Rol.ADMIN) {
        botones.push(
          h('button', {
            type: 'button',
            class: 'p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors',
            title: 'Eliminar registro',
            onClick: () => usuario.id && onDelete(usuario.id)
          }, '🗑')
        );
      }
      return h('div', { class: 'flex items-center justify-center w-full h-full' }, botones);
    }
  }
];