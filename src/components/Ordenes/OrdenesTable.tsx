
import { RevoGrid } from '@revolist/react-datagrid';
import { Template, type ColumnDataSchemaModel } from '@revolist/react-datagrid';
import type { ColumnRegular, ColumnTemplateProp } from '@revolist/react-datagrid';
import { Edit2, ImageIcon, Images, Inbox, Trash2, FileText } from 'lucide-react';
import { EstadoMapeado, MAPEO_ESTADOS } from '../ui/StatusBadge';
import { MAX_TRABAJO_REALIZADO, type EdicionRapidaRequest, type EstadoClaro, type OrdenTrabajo } from '../../types/Ordenes';

interface Props {
    ordenes: OrdenTrabajo[];
    cargando?: boolean;
    nombreTecnico?: (doc: string) => string | null;
    onVerImagenes?: (orden: OrdenTrabajo) => void;
    onEliminar?: (orden: OrdenTrabajo) => void;
}

const opcionesEstado = Object.entries(MAPEO_ESTADOS.campo).map(([valor, info]) => ({ valor, etiqueta: info.label }));
// ===== 1. Constantes de la grilla =====
const ALTO_FILA = 37;      // --fc-row-h
const FILAS_MINIMAS = 10; 
const celdaArchivo = ({ model, onVer }:ColumnDataSchemaModel & { onVer?: (o: OrdenTrabajo) => void } ) => {
        const orden = model as OrdenTrabajo & { cantArchivos: number };
        return(
        <button
            type="button"
            onClick={() => onVer?.(orden)}
            disabled={orden.cantArchivos === 0}
            className="inline-flex items-center gap-1.5 text-gray-600 hover:text-red-600 disabled:opacity-40"
            title="Ver imágenes"
        >
            <ImageIcon size={16} />
            <span>{orden.cantArchivos}</span>
        </button>
    );  
}

export const OrdenesTable = ({ ordenes, cargando, nombreTecnico, onVerImagenes, onEliminar }: Props) => {

    const filas = ordenes.map(o => ({ ...o, cantArchivos: o.archivos?.length ?? 0,estado: MAPEO_ESTADOS.campo[o.estadoCampo]?.label }))
    const filasOrdenadas = [...filas].sort( (a,b) => a.ordenTrabajoId - b.ordenTrabajoId);
    const columnas : ColumnRegular[] = [
        //prop => propiedad de la columna, name => nombre de la columna,size: tamaño de la columna.
        { prop: 'ordenTrabajoId', name: 'Orden_ID', size: 120, readonly:true },
        { prop: 'sot', name: 'SOT', size: 120 },
        { prop: 'docTecnico', name: 'Doc. técnico', size: 140},
        { prop: 'trabajoRealizado', name: 'Trabajo realizado', size: 320 },
        { prop: 'estadoCampo', name: 'Estado Campo', size: 140,readonly:true, cellTemplate: (h,props) => h('span',{class:'inline-flex h-5 items-center whitespace-nowrap rounded-badge px-2 text-[13px] font-bold leading-5 text-white bg-success'},props.model.estado)},
        { prop: 'cantArchivos', name: 'Archivos', size: 140 , cellTemplate: Template(((props: any) => celdaArchivo({ ...props, onVer: onVerImagenes })) as any) },
        { prop: 'usuarioId', name: 'Usuario Creador', size: 240},
    ];

   
    return (
        <div style={{ height: 320 }}>
            <RevoGrid source={filasOrdenadas} columns={columnas} />
        </div>
    );
};