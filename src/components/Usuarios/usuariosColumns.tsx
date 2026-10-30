import { Rol } from '../../types/usuario.types';
import type { Usuario } from '../../types/usuario.types';
import type { ColumnRegular } from '@revolist/react-datagrid';

export const getUsuariosColumns = (
  onDelete: (id: number) => void,
  onChangePassword: (usuario: Usuario) => void,
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
  { prop: 'nombreCompleto', name: 'Nombre Completo', size: 250, readonly:true},
  { prop: 'documentoIdentidad', name: 'Documento', size: 150, readonly:true},
  { prop: 'email', name: 'Email', size: 250, readonly:true},
  { 
    prop: 'rol', 
    name: 'Rol', 
    size: 150,
    columnType: 'select',
    source: [Rol.ADMIN, Rol.TECNICO, Rol.ALMACEN],
    cellTemplate: (h: any, props: any) => {
      let rol = props.model[props.prop];
      if (rol === undefined || rol === null || rol === '') return ''; 

      // Si por alguna razón la celda recibe el entero de C#, lo traducimos al texto
      if (rol === 0 || rol === '0') rol = Rol.ADMIN;
      if (rol === 1 || rol === '1') rol = Rol.TECNICO;
      if (rol === 2 || rol === '2') rol = Rol.ALMACEN;

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
    size: 90,
    pin: 'colPinEnd',
    readonly: true,
    cellTemplate: (h: any, props: any) => {
        const row = props.model;
        if (!row.id) return '';

        return h('div', { class: 'flex items-center justify-center gap-3 w-full h-full' }, [
            // NUEVO BOTÓN PARA CONTRASEÑA
            h('button', {
                type: 'button',
                class: 'text-gray-400 hover:text-amber-500 transition-colors p-1',
                title: 'Asignar / Cambiar Contraseña',
                onClick: () => onChangePassword && onChangePassword(row)
            }, '🔑'),
            
            // BOTÓN ELIMINAR (El que ya tenías)
            h('button', {
                type: 'button',
                class: 'text-gray-400 hover:text-red-600 transition-colors p-1',
                title: 'Eliminar usuario',
                onClick: () => onDelete && onDelete(row.id)
            }, '✕')
        ]);
    }
}
];