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
    return <div className="p-8 text-center text-label">Cargando datos...</div>;
  }

  const getRolBadgeClass = (rol: string) => {
    switch (rol) {
      case Rol.ADMIN:
        return 'bg-primary-soft text-primary';
      case Rol.TECNICO:
        return 'bg-primary-soft text-primary';
      case Rol.ALMACEN:
        return 'bg-warning-soft text-warning';
      default:
        return 'bg-page text-ink';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-page text-label font-semibold border-b border-line">
          <tr>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Nombre Completo</th>
            <th className="px-6 py-4">Documento</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Rol</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-label">
                No hay usuarios registrados.
              </td>
            </tr>
          ) : (
            usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-page transition-colors">
                <td className="px-6 py-4 text-label">#{usuario.id}</td>
                <td className="px-6 py-4 font-medium text-ink">{usuario.nombreCompleto}</td>
                <td className="px-6 py-4 text-label">{usuario.documentoIdentidad}</td>
                <td className="px-6 py-4 text-label">{usuario.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-pill ${getRolBadgeClass(usuario.rol)}`}>
                    {usuario.rol}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      title="Editar"
                      onClick={() => onEdit(usuario)}
                      className="p-1.5 text-muted hover:text-primary hover:bg-primary-soft rounded transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    {rolLogueado === Rol.ADMIN && (
                      <button
                        type="button"
                        title="Eliminar"
                        onClick={() => onDelete(usuario.id)}
                        className="p-1.5 text-muted hover:text-danger hover:bg-danger-soft rounded transition-colors"
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