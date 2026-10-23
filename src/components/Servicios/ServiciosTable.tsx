import type{ Servicio } from '../../types/servicio';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  servicios: Servicio[];
  isLoading: boolean;
  onEdit: (servicio: Servicio) => void;
  onDelete: (codigo: number) => void;
}

export const ServiciosTable = ({ servicios, isLoading, onEdit, onDelete }: Props) => {
  if (isLoading) {
    return <div className="p-8 text-center text-label">Cargando datos...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-page text-label font-semibold border-b border-line">
          <tr>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Nombre del Servicio</th>
            <th className="px-6 py-4">Precio</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {servicios.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-label">
                No hay servicios registrados.
              </td>
            </tr>
          ) : (
            servicios.map((servicio) => (
              <tr key={servicio.codigo} className="hover:bg-page transition-colors">
                <td className="px-6 py-4 text-label">#{servicio.codigo}</td>
                <td className="px-6 py-4 font-medium text-ink">{servicio.nombre}</td>
                <td className="px-6 py-4 font-medium text-ink">{servicio.precio}</td>
                <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-medium bg-primary-soft text-primary rounded-pill">
                        {servicio.categoria} {/* Ahora imprimimos el texto directamente */}
                    </span>
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                        title="Editar"
                        onClick={() => onEdit(servicio)}
                        className="p-1.5 text-muted hover:text-primary hover:bg-primary-soft rounded transition-colors"
                        >
                        <Pencil size={18} />
                        </button>
                        <button 
                        title="Eliminar"
                        onClick={() => onDelete(servicio.codigo)}
                        className="p-1.5 text-muted hover:text-danger hover:bg-danger-soft rounded transition-colors"
                        >
                        <Trash2 size={18} />
                        </button>
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