import { useState, useEffect } from 'react';
import { 
  getUsuarios, 
  createUsuario, 
  updateUsuario, 
  deleteUsuario 
} from '../../services/usuario.service';
import type { 
  Usuario, 
  RegisterRequestDto, 
  EditRequestDto, 
  ListUsuariosRequest 
} from '../../types/usuario.types';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = async (params?: ListUsuariosRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getUsuarios(params);
      setUsuarios(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar usuarios.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const addUsuario = async (nuevoUsuario: RegisterRequestDto) => {
    try {
      setIsLoading(true);
      setError(null);
      await createUsuario(nuevoUsuario);
      await fetchUsuarios();
    } catch (err: any) {
      const mensajeError = err.response?.data?.error || 'Error al crear el usuario.';
      setError(mensajeError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const editUsuario = async (datosActualizados: EditRequestDto) => {
    try {
      setIsLoading(true);
      setError(null);
      await updateUsuario(datosActualizados);

      // Actualización optimista del estado local
      setUsuarios((usuariosActuales) =>
        usuariosActuales.map((usuario) =>
          usuario.id === datosActualizados.id
            ? { ...usuario, ...datosActualizados }
            : usuario
        )
      );
    } catch (err: any) {
      const mensajeError = err.response?.data?.error || 'Error al actualizar el usuario.';
      setError(mensajeError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeUsuario = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await deleteUsuario(id);

      // Filtrado directo en memoria tras confirmación del backend
      setUsuarios((usuariosActuales) =>
        usuariosActuales.filter((usuario) => usuario.id !== id)
      );
    } catch (err: any) {
      const mensajeError = err.response?.data?.error || 'Error al eliminar el usuario.';
      setError(mensajeError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    usuarios,
    isLoading,
    error,
    fetchUsuarios,
    addUsuario,
    editUsuario,
    removeUsuario,
  };
};