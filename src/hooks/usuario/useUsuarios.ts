import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../useAuth';
import type { ChangueOtherPasswordRequestDto  } from '../../types/auth.types';
import { 
  getUsuarios, 
  createUsuario, 
  updateUsuario, 
  deleteUsuario, 
  changeUserPassword
} from '../../services/usuario.service';
import type { 
  Usuario, 
  RegisterRequestDto, 
  EditRequestDto, 
  ListUsuariosRequest 
} from '../../types/usuario.types';

export const useUsuarios = () => {
  const { rol } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<ListUsuariosRequest>(
          { pagina: 1, cantidadPorPagina: 20 }
  );
  const fetchUsuarios = useCallback( async () => {
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
  }, [params]);

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

  const adminChangeUserPassword = async (id:number,request:ChangueOtherPasswordRequestDto ) => {
    try {
      setIsLoading(true);
      setError(null);
      await changeUserPassword(id,request);
      // Opcional: await fetchUsuarios(); // Descomenta si necesitas refrescar la grilla
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Error al actualizar la contraseña.';
      setError(msg);
      throw new Error(msg); // Lanza el error para que el Modal lo capture y no se cierre
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
    adminChangeUserPassword,
  };
};