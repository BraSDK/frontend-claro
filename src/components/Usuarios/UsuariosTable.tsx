import React, { useState, useEffect, useMemo } from 'react';
import ColumnSelect from '@revolist/revogrid-column-select';
import { RevoGrid } from '@revolist/react-datagrid';
import { temaClaro } from '@/theme/revogrid-theme';
import { DataTable } from '@/components/shared/Tabla';
import { RotateCcw } from 'lucide-react';
import type { Usuario } from '../../types/usuario.types';
import { getUsuariosColumns } from './usuariosColumns';

const MAX_FILAS_EXCEL = 200;
const DRAFT_STORAGE_KEY = 'usuarios_grid_draft_auto_v1';
interface Props {
  usuarios: Usuario[];
  isLoading: boolean;
  onAutoSave: (filaEditada: Partial<Usuario>) => Promise<void>;
  onDelete: (id: number) => void;
  // rolLogueado?: string | null;
  onChangePassword?: (usuario: Usuario) => void;
}

export const UsuariosTable = ({
  usuarios,
  isLoading,
  onAutoSave,
  onDelete,
  onChangePassword
}: Props) => {
  const [gridData, setGridData] = useState<Partial<Usuario>[]>([]);
  const [hayBorrador, setHayBorrador] = useState(false);

  // Instanciar el tipo de columna select
  const pluginSelect = useMemo(() => ({
    select: new ColumnSelect()
  }), []);

  const restablecerDesdeServidor = (datosServidor: Usuario[]) => {
    const filasVaciasNecesarias = Math.max(0, MAX_FILAS_EXCEL - datosServidor.length);
    const arrayVacio: Partial<Usuario>[] = Array.from({ length: filasVaciasNecesarias }).map(() => ({
      id: undefined,
      nombreCompleto: '',
      documentoIdentidad: '',
      email: '',
      rol: undefined,
      fechaRegistro: undefined
    }));

    setGridData([...datosServidor, ...arrayVacio]);
    setHayBorrador(false);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  // Inicializar los datos del servidor y rellenar las filas vacías
  useEffect(() => {
    if (isLoading) return;

    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft) as Partial<Usuario>[];
        if (Array.isArray(parsedDraft) && parsedDraft.length > 0) {
          setGridData(parsedDraft);
          setHayBorrador(true);
          return;
        }
      } catch (e) {
        console.error("Error al recuperar borrador local:", e);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    }

    // Si no hay borrador, usa el helper para cargar los datos con filas vacías
    restablecerDesdeServidor(usuarios);
  }, [usuarios, isLoading]);

  const columns = useMemo(() => getUsuariosColumns(onDelete, onChangePassword), [onDelete, onChangePassword]);

  // Capturar el evento de salida de celda para el autoguardado
  const handleAfterEdit = async (e: CustomEvent) => {
    setHayBorrador(true);
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(gridData));
    // RevoGrid envía la fila completa modificada dentro de e.detail.model
    const filaEditada = e.detail.model as Partial<Usuario>;
    
    // Llamar a la función del padre para decidir si es POST (nueva) o PUT (edición)
    await onAutoSave(filaEditada);
  };

  const descartarBorrador = () => {
    const confirmar = window.confirm('¿Deseas limpiar la memoria local y recargar los datos originales del servidor?');
    if (confirmar) {
      restablecerDesdeServidor(usuarios);
    }
  };

  return (
    <DataTable
      titulo="Usuarios Registrados"
      cantidad={usuarios.length}
      acciones={
        hayBorrador ? (
          <button
          type = "button"
          onClick = {descartarBorrador}
          className = "inline-flex h-[32px] items-center gap-1.5 rounded-md px-3 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          title = "Descartar ediciones incompletas en memoria"
          >
            <RotateCcw size={14}> Descartar borrador local</RotateCcw>
          </button>
        ) : undefined
      }
    >
      {/* Contenedor responsivo con scroll interno y altura adaptativa */}
      <div className="relative w-full overflow-x-auto border border-gray-200 rounded-md">
        <div className="min-w-[650px] w-full" style={{ height: 'calc(100vh - 300px)', minHeight: '400px', maxHeight: '600px' }}>
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <span className="text-gray-500 font-medium">Cargando datos...</span>
            </div>
          )}

          <RevoGrid
            columns={columns}
            source={gridData}
            theme={temaClaro.name}
            rowSize={45}
            stretch={true}
            columnTypes={pluginSelect}
            onAfteredit={handleAfterEdit}
          />
        </div>
      </div>
    </DataTable>
  );
};