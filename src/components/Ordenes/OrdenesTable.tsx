import { RevoGrid } from '@revolist/react-datagrid';
import { Template, type ColumnDataSchemaModel } from '@revolist/react-datagrid';
import type { ColumnRegular, ColumnTemplateProp } from '@revolist/react-datagrid';
import { Edit2, ImageIcon, Images, Inbox, Trash2, FileText } from 'lucide-react';
import { EstadoMapeado, MAPEO_ESTADOS } from '../ui/StatusBadge';
import { MAX_TRABAJO_REALIZADO, type EdicionRapidaRequest, type EstadoClaro, type OrdenTrabajo } from '../../types/Ordenes';

interface Props {
    ordenes: OrdenTrabajo[];
    cargando?: boolean;
    esTecnico?: boolean;
    nombreTecnico?: (doc: string) => string | null;
    onVerImagenes?: (orden: OrdenTrabajo) => void;
    onEditar?: (orden: OrdenTrabajo) => void;
    onEliminar?: (orden: OrdenTrabajo) => void;
    seleccionadas?: number[];
    onToggleSeleccion?: (sot: number) => void;
    onToggleTodas?: (sots: number[]) => void;
}

const opcionesEstado = Object.entries(MAPEO_ESTADOS.campo).map(([valor, info]) => ({ valor, etiqueta: info.label }));
// ===== 1. Constantes de la grilla =====
const ALTO_FILA = 37;      // --fc-row-h
const FILAS_MINIMAS = 10; 
const BASE = 'inline-flex h-5 items-center whitespace-nowrap rounded-badge px-2 text-[13px] font-bold leading-5 text-white';
const COLOR_ESTADO : Record<string,string>= {
    'Completado':"bg-success",
    'En progreso':"bg-warning",
    'No completado':"bg-danger"
} 

const COLOR_VALIDACION_FOTOS : Record<string,string> = {
    'sin validacion':"bg-muted",
    'correcto':"bg-success",
    'observado':"bg-warning"
}
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

export const OrdenesTable = ({ ordenes, esTecnico = false, nombreTecnico, onVerImagenes, onEditar, seleccionadas = [], onToggleSeleccion, onToggleTodas }: Props) => {   // nombreTecnico = nombreDe de useTecnicos (lo pasa OrdenesPage)
    
    const sotsVisibles = ordenes.map((o) => o.sot);
    const todasMarcadas = sotsVisibles.length > 0 && sotsVisibles.every((s) => seleccionadas.includes(s));

    const filas = ordenes.map(o => ({
        ...o,
        seleccionada: seleccionadas.includes(o.sot),
        cantArchivos: o.archivos?.length ?? 0,
        estado: MAPEO_ESTADOS.campo[o.estadoCampo]?.label,
        tecnico: nombreTecnico?.(o.docTecnico) ?? o.docTecnico, 
        validacion: MAPEO_ESTADOS.validacion[o.estadoAlmacen]?.label,
    }));
    const filasOrdenadas = [...filas].sort( (a,b) => a.ordenTrabajoId - b.ordenTrabajoId);

    const columnas: ColumnRegular[] = [
        {
            prop: 'seleccionada',
            name: '',
            size: 44,
            readonly: true,
            pin: 'colPinStart',
            columnTemplate: (h) =>
                h('div', { class: 'flex h-full w-full items-center justify-center' }, [
                    h('input', {
                        type: 'checkbox',
                        checked: todasMarcadas,
                        title: 'Seleccionar todas las visibles',
                        className: 'h-4 w-4 cursor-pointer accent-red-600',
                        onChange: () => onToggleTodas?.(sotsVisibles),
                    }),
                ]),
            cellTemplate: (h, props) => {
                const sot = Number(props.model.sot);
                const checked = seleccionadas.includes(sot);
                return h('div', { class: 'flex h-full w-full items-center justify-center' }, [
                    h('input', {
                        type: 'checkbox',
                        checked,
                        className: 'h-4 w-4 cursor-pointer accent-red-600',
                        onClick: (e: MouseEvent) => e.stopPropagation(),
                        onChange: () => onToggleSeleccion?.(sot),
                    }),
                ]);
            },
        },
        { prop: 'ordenTrabajoId', name: 'Orden_ID', size: 110, readonly: true },
        { prop: 'sot', name: 'SOT', size: 120 },
        { prop: 'docTecnico', name: 'Doc. técnico', size: 140 },
        { prop: 'tecnico', name: 'Técnico', size: 240, readonly: true },
        { prop: 'trabajoRealizado', name: 'Trabajo realizado', size: 320 },
        {
            prop: 'estadoCampo',
            name: 'Estado Campo',
            size: 140,
            readonly: true,
            cellTemplate: (h, props) =>
                h('span', { class: `${BASE} ${COLOR_ESTADO[props.model.estado] ?? 'bg-gray-400'}` }, props.model.estado),
        },
        {
            prop: 'cantArchivos',
            name: 'Archivos',
            size: 120,
            cellTemplate: (h, props) =>
                h(
                    'button',
                    {
                        class: 'inline-flex items-center gap-1.5 text-gray-600 hover:text-red-600 disabled:opacity-40',
                        disabled: props.model.cantArchivos === 0,
                        onClick: () => onVerImagenes?.(props.model as OrdenTrabajo),
                    },
                    `🖼 ${props.model.cantArchivos}`
                ),
        },
        {
            prop: 'validacion',
            name: 'Validacion',
            size: 140,
            readonly: true,
            cellTemplate: (h, props) =>
                h('span', { class: `${BASE} ${COLOR_VALIDACION_FOTOS[props.model.validacion] ?? 'bg-gray-400'}` }, props.model.validacion),
        },
        {
            prop: 'acciones',
            name: 'Acciones',
            size: 95,
            pin: 'colPinEnd',
            readonly: true,
            cellTemplate(h, props) {
                const orden = props.model as OrdenTrabajo;
                const sinValidar =
                    Number(orden.estadoAlmacen) === 0 || props.model.validacion === 'sin validacion';

                // Solo el técnico queda bloqueado cuando la orden ya fue revisada
                const bloqueado = esTecnico && !sinValidar;

                if (bloqueado) {
                    return h(
                        'span',
                        {
                            class: 'inline-flex w-full items-center justify-center text-xs text-gray-400',
                            title: 'Orden ya revisada: no se puede editar',
                        },
                        '🔒'
                    );
                }

                return h(
                    'button',
                    {
                        type: 'button',
                        class: 'inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700',
                        title: 'Editar orden',
                        onClick(e: MouseEvent) {
                            e.stopPropagation();
                            onEditar?.(orden);
                        },
                    },
                    '✏️ Editar'
                );
            },
        },
    ];

    return (
        <div style={{ height: 320 }}>
            <RevoGrid source={filasOrdenadas} columns={columnas} stretch={true} />
        </div>
    );
};