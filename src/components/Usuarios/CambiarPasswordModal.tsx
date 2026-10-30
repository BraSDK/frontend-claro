import React, { useState } from 'react';
import { Modal } from '@/components/shared/Modal';
import { Campo, Entrada } from '@/components/shared/Filtros';
import { Boton } from '@/components/shared/Tabla';
import type { Usuario } from '../../types/usuario.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onSubmit: (id: number, nuevaClave: string) => Promise<void>;
}

export const CambiarPasswordModal: React.FC<Props> = ({ isOpen, onClose, usuario, onSubmit }) => {
  const [clave, setClave] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!usuario) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (clave !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (clave.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(usuario.id, clave);
      setClave('');
      setConfirmar('');
      onClose();
    } catch (err) {
      setError('Error al cambiar la contraseña. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Contraseña para: ${usuario.nombreCompleto}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <div className="text-sm font-medium text-red-500">{error}</div>}
        
        <Campo label="Nueva Contraseña">
          <Entrada 
            type="password" 
            value={clave} 
            onChange={(e) => setClave(e.target.value)} 
            required 
            placeholder="Mínimo 6 caracteres"
          />
        </Campo>

        <Campo label="Confirmar Contraseña">
          <Entrada 
            type="password" 
            value={confirmar} 
            onChange={(e) => setConfirmar(e.target.value)} 
            required 
            placeholder="Vuelve a escribir la contraseña"
          />
        </Campo>

        <div className="mt-2 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button 
            type="button" 
            onClick={onClose} 
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <Boton type="submit" disabled={loading} className="w-auto px-6">
            {loading ? 'Guardando...' : 'Actualizar'}
          </Boton>
        </div>
      </form>
    </Modal>
  );
};