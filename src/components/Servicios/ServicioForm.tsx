import { useState } from 'react';
import type { Servicio, CategoriaServicio } from '../../types/servicio';

interface ServicioFormProps {
  initialData?: Servicio | null; // Si viene null es Crear, si trae datos es Editar
  onSubmit: (data: Partial<Servicio>) => void;
  onCancel: () => void;
}

export const ServicioForm = ({ initialData, onSubmit, onCancel }: ServicioFormProps) => {
  // Inicializamos el estado con los datos a editar, o vacío si es nuevo
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    precio: initialData?.precio || 0,
    categoria: initialData?.categoria || 'HFC' as CategoriaServicio,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Servicio</label>
        <input
          type="text"
          required
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
          placeholder="Ej. Internet Fibra 100MB"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
        <input
          type="number"
          step="0.01"
          required
          value={formData.precio}
          onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <select
          value={formData.categoria}
          onChange={(e) => setFormData({ ...formData, categoria: e.target.value as CategoriaServicio })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm bg-white"
        >
          <option value="HFC">HFC</option>
          <option value="FTH">FTH</option>
          <option value="MANTTO">Mantenimiento</option>
        </select>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
        >
          {initialData ? 'Guardar Cambios' : 'Registrar Servicio'}
        </button>
      </div>
    </form>
  );
};