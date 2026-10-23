import React, { useState, useEffect, useMemo } from 'react';
import { RevoGrid } from '@revolist/react-datagrid';
import { temaClaro } from '@/theme/revogrid-theme';
import { DataTable, Boton } from '@/components/shared/Tabla';
import { Save } from 'lucide-react';
import type { Usuario } from '../../types/usuario.types';
import { getUsuariosColumns } from './usuariosColumns';

const MAX_FILAS_EXCEL = 200;

interface Props {
  usuarios: Usuario[];
  isLoading: boolean;
  onSaveMasivo: (datosValidos: Partial<Usuario>[]) => Promise<void>;
  onDelete: (id: number) => void;
  rolLogueado?: string | null;
}

export const UsuariosTable = ({
  usuarios,
  isLoading,
  onSaveMasivo,
  onDelete,
  rolLogueado
}: Props) => {
  const [gridData, setGridData] = useState<Partial<Usuario>[]>([]);
  const [hayCambios, setHayCambios] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Mapeamos los usuarios reales y rellenamos hasta completar 200 filas vacías
  useEffect(() => {
    const filasVaciasNecesarias = Math.max(0, MAX_FILAS_EXCEL - usuarios.length);
    
    const arrayVacio: Partial<Usuario>[] = Array.from({ length: filasVaciasNecesarias }).map(() => ({
      id: undefined,
      nombreCompleto: '',
      documentoIdentidad: '',
      email: '',
      rol: undefined,
      fechaRegistro: undefined
    }));

    setGridData([...usuarios, ...arrayVacio]);
    setHayCambios(false);
  }, [usuarios]);

  const columns = useMemo(() => getUsuariosColumns(onDelete, rolLogueado), [onDelete, rolLogueado]);

  const handleAfterEdit = () => {
    setHayCambios(true);
  };

  const procesarGuardado = async () => {
    setGuardando(true);
    try {
      // Filtramos únicamente las filas que tengan al menos Nombre, Documento o Email
      const filasValidas = gridData.filter(row => 
        row.nombreCompleto?.trim() || 
        row.documentoIdentidad?.trim() || 
        row.email?.trim()
      );

      await onSaveMasivo(filasValidas);
      setHayCambios(false);
    } catch (error) {
      console.error("Error al guardar de forma masiva:", error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <DataTable
      titulo="Usuarios Registrados"
      cantidad={usuarios.length}
      acciones={
        <Boton 
          onClick={procesarGuardado} 
          disabled={!hayCambios || guardando || isLoading}
          icono={<Save size={16} />}
        >
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </Boton>
      }
    >
      <div className="relative w-full border border-gray-200 rounded-md overflow-hidden" style={{ height: '550px' }}>
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
          onAfteredit={handleAfterEdit}
        />
      </div>
    </DataTable>
  );
};