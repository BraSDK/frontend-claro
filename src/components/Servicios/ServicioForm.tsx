import { useState } from 'react';
import type { Servicio, CategoriaServicio } from '../../types/servicio';

interface ServicioFormProps {
  initialData?: Servicio | null; 
  onSubmit: (data: Partial<Servicio>) => void;
  onCancel: () => void;
}

export const ServicioForm = ({ initialData, onSubmit, onCancel }: ServicioFormProps) => {
  // Inicializamos el estado con los datos a editar, o vacío si es nuevo
  const [formData, setFormData] = useState({
    codigo: initialData?.codigo || '',
    nombre: initialData?.nombre || '',
    precio: initialData?.precio || 0,
    categoria: initialData?.categoria || 'HFC' as CategoriaServicio,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, codigo: Number(formData.codigo) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Nombre del Servicio</label>
        <input
          type="text"
          required
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          className="w-full px-4 py-2 border border-line rounded-control focus:ring-2 focus:ring-info focus:border-transparent text-sm"
          placeholder="Ej. Internet Fibra 100MB"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Precio</label>
        <input
          type="number"
          step="0.01"
          required
          value={formData.precio}
          onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
          className="w-full px-4 py-2 border border-line rounded-control focus:ring-2 focus:ring-info focus:border-transparent text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Categoría</label>
        <select
          value={formData.categoria}
          onChange={(e) => setFormData({ ...formData, categoria: e.target.value as CategoriaServicio })}
          className="w-full px-4 py-2 border border-line rounded-control focus:ring-2 focus:ring-info focus:border-transparent text-sm bg-surface"
        >
          <option value="HFC">HFC</option>
          <option value="FTH">FTH</option>
          <option value="MANTTO">Mantenimiento</option>
        </select>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-3 pt-4 border-t border-line mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-[30px] items-center justify-center gap-1.5 rounded-control border border-line-input bg-surface px-3 text-sm font-medium text-ink transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex h-[30px] items-center justify-center gap-1.5 rounded-control bg-primary px-3 text-sm font-bold text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-50"
        >
          {initialData ? 'Guardar Cambios' : 'Registrar Servicio'}
        </button>
      </div>
    </form>
  );
};