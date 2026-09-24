import { useState, useEffect } from 'react';
import type { Usuario, RegisterRequestDto, EditRequestDto } from '../../types/usuario.types';
import { Rol } from '../../types/usuario.types';

interface Props {
  initialData: Usuario | null;
  onSubmit: (datos: RegisterRequestDto | EditRequestDto) => Promise<void>;
  onCancel: () => void;
  rolLogueado?: string | null;
}

export const UsuarioForm = ({
  initialData,
  onSubmit,
  onCancel,
  rolLogueado
}: Props) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    documentoIdentidad: '',
    email: '',
    password: '',
    rol: Rol.TECNICO as Rol
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombreCompleto: initialData.nombreCompleto || '',
        documentoIdentidad: initialData.documentoIdentidad || '',
        email: initialData.email || '',
        password: '',
        rol: (initialData.rol as Rol) || Rol.TECNICO
      });
    } else {
      setFormData({
        nombreCompleto: '',
        documentoIdentidad: '',
        email: '',
        password: '',
        rol: Rol.TECNICO
      });
    }
    setErrorLocal(null);
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    // Validación básica en frontend
    if (!formData.nombreCompleto.trim() || !formData.documentoIdentidad.trim() || !formData.email.trim()) {
      setErrorLocal('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (!isEditing && !formData.password.trim()) {
      setErrorLocal('La contraseña es requerida para el registro.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditing) {
        const payloadEdit: EditRequestDto = {
          id: initialData!.id,
          nombreCompleto: formData.nombreCompleto,
          documentoIdentidad: formData.documentoIdentidad,
          email: formData.email,
          rol: formData.rol
        };
        await onSubmit(payloadEdit);
      } else {
        const payloadRegister: RegisterRequestDto = {
          nombreCompleto: formData.nombreCompleto,
          documentoIdentidad: formData.documentoIdentidad,
          email: formData.email,
          password: formData.password,
          rol: formData.rol
        };
        await onSubmit(payloadRegister);
      }
    } catch (err: any) {
      setErrorLocal(err.response?.data?.error || 'Ocurrió un error al procesar el formulario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Restricción: Solo ADMIN puede modificar el rol asignado
  const canChangeRole = rolLogueado === Rol.ADMIN;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {errorLocal && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
          {errorLocal}
        </div>
      )}

      {/* Nombre Completo */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nombreCompleto" className="text-sm font-medium text-gray-700">
          Nombre Completo
        </label>
        <input
          id="nombreCompleto"
          name="nombreCompleto"
          type="text"
          required
          value={formData.nombreCompleto}
          onChange={handleChange}
          placeholder="Ej. Juan Pérez"
          className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
      </div>

      {/* Documento de Identidad */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="documentoIdentidad" className="text-sm font-medium text-gray-700">
          Documento de Identidad
        </label>
        <input
          id="documentoIdentidad"
          name="documentoIdentidad"
          type="text"
          required
          value={formData.documentoIdentidad}
          onChange={handleChange}
          placeholder="DNI o Cédula"
          className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Correo Electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="usuario@claro.com"
          className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
      </div>

      {/* Contraseña (Solo en creación) */}
      {!isEditing && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required={!isEditing}
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      )}

      {/* Rol */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="rol" className="text-sm font-medium text-gray-700">
          Rol en el Sistema
        </label>
        <select
          id="rol"
          name="rol"
          disabled={!canChangeRole}
          value={formData.rol}
          onChange={handleChange}
          className={`w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
            !canChangeRole ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'
          }`}
        >
          {Object.values(Rol).map((rolOption) => (
            <option key={rolOption} value={rolOption}>
              {rolOption}
            </option>
          ))}
        </select>
        {!canChangeRole && (
          <span className="text-xs text-gray-400">
            Solo un administrador puede modificar este campo.
          </span>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Registrar Usuario'}
        </button>
      </div>
    </form>
  );
};