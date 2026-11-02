import type { ColumnRegular } from '@revolist/react-datagrid';
import { Editor, type Editors } from '@revolist/react-datagrid';
import type { FilaLiquidacionGrid } from '../../types/liquidacion.types';
import FechaEditor from './FechaEditor';

const formatSoles = (h: any, props: any) => {
  const valor = props.model[props.prop];
  if (valor === null || valor === undefined || valor === '') {
    return h('span', { class: 'text-gray-400' }, '');
  }
  return h('span', { class: 'font-mono text-sm' }, `S/ ${Number(valor).toFixed(2)}`);
};

const EDITOR_FECHA = 'editor-fecha';

export const gridEditors: Editors = {
  [EDITOR_FECHA]: Editor(FechaEditor),
};

export const getLiquidacionesColumns = (
    onDelete?: (sot: number) => void
  ): ColumnRegular[] => [
    { 
      prop: 'sot', 
      name: 'SOT',
      size: 100,
      readonly: (props: any) => !!props.model?.esRegistroExistente,   // la SOT es la clave: editable solo en filas nuevas
      cellTemplate: (h: any, props: any) => {
        const sot = props.model[props.prop];
        return h('span', { class: 'font-mono text-sm' }, sot || '');
      }
      , pin:'colPinStart'
    },
    { 
        prop: 'tecnico', 
        name: 'Técnico', 
        size: 200,
        cellTemplate: (h: any, props: any) => {
            const tecnico = props.model[props.prop];
            if (!tecnico) return h('span', { class: 'text-gray-400 italic text-xs'}, 'Sin asignar');
            return tecnico;
        }
    },
    { prop: 'tipoOrden', name: 'Tipo Orden', size: 120 },
    { 
        prop: 'fechaProgramacion', 
        name: 'F. Programación', 
        size: 140,
        editor: EDITOR_FECHA,
        // Al editar, el usuario ingresará 'YYYY-MM-DD', aquí lo formateamos visualmente
        cellTemplate: (h: any, props: any) => {
          const fecha = props.model[props.prop];
          if (!fecha) return '';
          
          // 'YYYY-MM-DD...' → 'DD/MM/YYYY' sin pasar por new Date():
          // el back guarda medianoche UTC y new Date() la movía al día anterior en hora de Perú
          const iso = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})/);
          return h('span', {}, iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : fecha);
        }
    },
    { prop: 'subTipoOrden', name: 'SubTipo Orden', size: 160},
    
    // --- BAREMOS Y MATERIALES (Cantidades / Precios) ---
    { prop: 'costoServicio', name: 'Costo Servicio', size: 120, cellTemplate: formatSoles },
    { prop: 'deco', name: 'Deco', size: 80 },
    { prop: 'repetidor', name: 'Repetidor', size: 100, cellTemplate: formatSoles },
    { prop: 'drop150', name: 'Drop 150', size: 150, cellTemplate: formatSoles },
    { prop: 'drop220', name: 'Drop 220', size: 150, cellTemplate: formatSoles},
    { prop: 'drop300', name: 'Drop 300', size: 150, cellTemplate: formatSoles},

    // --- OBSERVACIONES (Textos) ---
    { prop: 'obsFotos', name: 'Obs. Fotos', size: 200 },
    { prop: 'obsNoPago', name: 'Obs. No Pago', size: 200 },
    { prop: 'obsSiPago', name: 'Obs. Sí Pago', size: 200 },

    // --- TOTAL Y ESTADO ---
    { 
        prop: 'total', 
        name: 'Total', 
        size: 120,
        readonly: true, // El total suele calcularse o venir fijo del backend
        cellTemplate: (h: any, props: any) => {
          const total = props.model[props.prop];
          return h('span', { class: 'font-medium text-green-600' }, total ? `S/ ${Number(total).toFixed(2)}` : '');
        }
        , pin:'colPinEnd'
    },
    {
        prop: 'acciones',
        name: '🗑️',
        size: 70,
        pin: 'colPinEnd',
        readonly: true,
        cellTemplate: ( h: any, props: any ) => {
            const row = props.model as FilaLiquidacionGrid;
            if (!row.sot) return '';
            
            return h('div', { class: 'flex items-center justify-center gap-3 w-full h-full' }, [
                h('button', {
                    type: 'button',
                    class: 'text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50',
                    title: 'Eliminar liquidación',
                    onClick: () => onDelete && row.sot && onDelete(row.sot)
                }, '✕')
            ]);
        }
    }
];