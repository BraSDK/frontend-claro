import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { ListarRequestLiquidacionesDto } from '../../types/liquidacion.types';

// Importamos las clases compartidas de tu diseño de tabla
import { 
    claseTabla, 
    claseTh, 
    claseTd, 
    claseFila, 
    FilasRelleno 
} from '@/components/shared/Tabla';

// Corregimos el nombre de la interfaz y la propiedad (de 'data' a 'liquidaciones')
interface LiquidacionesTableProps {
    liquidaciones: ListarRequestLiquidacionesDto[];
    isLoading: boolean;
    onEdit?: (liquidacion: ListarRequestLiquidacionesDto) => void;
    onDelete?: (sot: number) => void;
}

export const LiquidacionesTable: React.FC<LiquidacionesTableProps> = ({ 
    liquidaciones, 
    isLoading, 
    onEdit, 
    onDelete 
}) => {
    if (isLoading) {
        return <div className="p-8 text-center text-label">Cargando liquidaciones...</div>;
    }

    if (liquidaciones.length === 0) {
        return <div className="p-8 text-center text-label">No se encontraron liquidaciones para los filtros aplicados.</div>;
    }

    return (
        <div className="w-full overflow-x-auto">
            {/* Usamos claseTabla para mantener el diseño tipo grilla (bordes separados) */}
            <table className={claseTabla}>
                <thead>
                    <tr>
                        <th className={claseTh}>SOT</th>
                        <th className={claseTh}>SubTipo Orden</th>
                        <th className={claseTh}>Técnico</th>
                        <th className={claseTh}>F. Programación</th>
                        <th className={claseTh}>Total Editable</th>
                        <th className={claseTh}>Estado</th>
                        <th className={claseTh}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {liquidaciones.map((row) => (
                        <tr key={row.sot} className={claseFila}>
                            <td className={claseTd}>{row.sot}</td>
                            <td className={claseTd}>{row.nombreSubTipoOrden}</td>
                            <td className={claseTd}>
                                {row.nombreTecnico || <span className="text-muted">Sin asignar</span>}
                            </td>
                            <td className={claseTd}>
                                {new Date(row.fechaProgramacion).toLocaleDateString()}
                            </td>
                            <td className={claseTd}>
                                {row.precioTotalEditable ? `S/ ${row.precioTotalEditable.toFixed(2)}` : '-'}
                            </td>
                            <td className={claseTd}>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-info-soft text-info">
                                    {row.estadoSistema}
                                </span>
                            </td>
                            <td className={claseTd}>
                                <div className="flex items-center justify-center gap-2">
                                    <button 
                                        className="text-label hover:text-info transition-colors"
                                        title="Editar liquidación"
                                        onClick={() => onEdit && onEdit(row)}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        className="text-label hover:text-danger transition-colors"
                                        title="Eliminar liquidación"
                                        onClick={() => onDelete && onDelete(row.sot)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    
                    {/* Filas de relleno para que la tabla no se vea "cortada" si hay menos de 10 registros */}
                    <FilasRelleno actuales={liquidaciones.length} minimo={10} columnas={7} />
                </tbody>
            </table>
        </div>
    );
};