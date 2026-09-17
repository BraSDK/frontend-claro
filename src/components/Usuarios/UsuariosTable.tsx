import type { Usuario } from '../../types/usuario.types';
import { Rol } from '../../types/usuario.types';
import { Pencil, Trash2 } from 'lucide-react';

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
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Cargando datos...</div>;
  }

  const getRolBadgeClass = (rol: string) => {
    switch (rol) {
      case Rol.ADMIN:
        return 'bg-purple-100 text-purple-700';
      case Rol.TECNICO:
        return 'bg-blue-100 text-blue-700';
      case Rol.ALMACEN:
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
          <tr>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Nombre Completo</th>
            <th className="px-6 py-4">Documento</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Rol</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                No hay usuarios registrados.
              </td>
            </tr>
          ) : (
            usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500">#{usuario.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{usuario.nombreCompleto}</td>
                <td className="px-6 py-4 text-gray-600">{usuario.documentoIdentidad}</td>
                <td className="px-6 py-4 text-gray-600">{usuario.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRolBadgeClass(usuario.rol)}`}>
                    {usuario.rol}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      title="Editar"
                      onClick={() => onEdit(usuario)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    {rolLogueado === Rol.ADMIN && (
                      <button
                        type="button"
                        title="Eliminar"
                        onClick={() => onDelete(usuario.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};