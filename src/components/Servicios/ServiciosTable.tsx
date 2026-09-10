import type{ Servicio } from '../../types/servicio';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  servicios: Servicio[];
  isLoading: boolean;
  onEdit: (servicio: Servicio) => void;
}

export const ServiciosTable = ({ servicios, isLoading, onEdit }: Props) => {
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Cargando datos...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
          <tr>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Nombre del Servicio</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {servicios.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                No hay servicios registrados.
              </td>
            </tr>
          ) : (
            servicios.map((servicio) => (
              <tr key={servicio.codigo} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500">#{servicio.codigo}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{servicio.nombre}</td>
                <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {servicio.categoria} {/* Ahora imprimimos el texto directamente */}
                    </span>
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                        title="Editar"
                        onClick={() => onEdit(servicio)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                        <Pencil size={18} />
                        </button>
                        <button 
                        title="Eliminar"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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