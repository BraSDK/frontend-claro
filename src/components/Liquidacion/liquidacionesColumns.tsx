import type { ColumnRegular } from '@revolist/react-datagrid';
import { Editor, type Editors } from '@revolist/react-datagrid';
import type { FilaLiquidacionGrid } from '../../types/liquidacion.types';
import { esNoPago, type PreciosAdicionales } from '../../utils/liquidacion.mapper';
import FechaEditor from './FechaEditor';

const formatSoles = (h: any, props: any) => {
  const valor = props.model[props.prop];
  if (valor === null || valor === undefined || valor === '') {
    return h('span', { class: 'text-gray-400' }, '');
  }
  return h('span', { class: 'font-mono text-sm' }, `S/ ${Number(valor).toFixed(2)}`);
};

// Cantidad de un adicional y, debajo, cuánto suma con el precio del catálogo
const cantidadConSubtotal = (precio: number | undefined) => (h: any, props: any) => {
  const cantidad = Number(props.model[props.prop]) || 0;
  if (!cantidad) return '';
  return h('div', { class: 'flex flex-col items-center leading-tight' }, [
    h('span', { class: 'font-mono text-sm' }, String(cantidad)),
    h('span', { class: precio ? 'text-[11px] text-gray-400' : 'text-[11px] text-amber-600' },
      precio ? `S/ ${(cantidad * precio).toFixed(2)}` : 'sin precio'),
  ]);
};

// "Drop 150 · S/ 12.00" en el encabezado para que se vea con qué precio se calcula
const titulo = (nombre: string, precio: number | undefined) =>
  precio === undefined ? nombre : `${nombre} · S/ ${precio.toFixed(2)}`;

const EDITOR_FECHA = 'editor-fecha';

export const gridEditors: Editors = {
  [EDITOR_FECHA]: Editor(FechaEditor),
};

export const getLiquidacionesColumns = (
    onDelete?: (sot: number) => void,
    precios: PreciosAdicionales = {}
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
    { prop: 'deco', name: titulo('Deco', precios['DECO']), size: 120, cellTemplate: cantidadConSubtotal(precios['DECO']) },
    { prop: 'repetidor', name: titulo('Repetidor', precios['REPETIDOR']), size: 140, cellTemplate: cantidadConSubtotal(precios['REPETIDOR']) },
    { prop: 'drop150', name: titulo('Drop 150', precios['DROP 150']), size: 140, cellTemplate: cantidadConSubtotal(precios['DROP 150']) },
    { prop: 'drop220', name: titulo('Drop 220', precios['DROP 220']), size: 140, cellTemplate: cantidadConSubtotal(precios['DROP 220']) },
    { prop: 'drop300', name: titulo('Drop 300', precios['DROP 300']), size: 140, cellTemplate: cantidadConSubtotal(precios['DROP 300']) },

    // --- OBSERVACIONES (Textos) ---
    { prop: 'obsFotos', name: 'Obs. Fotos', size: 200 },
    {
      prop: 'obsNoPago', name: 'Obs. No Pago', size: 200,
      cellTemplate: (h: any, props: any) => {
        const texto = props.model[props.prop];
        return texto ? h('span', { class: 'text-red-600', title: texto }, texto) : '';
      },
    },
    { prop: 'obsSiPago', name: 'Obs. Sí Pago', size: 200 },

    // --- TOTAL Y ESTADO ---
    { 
        prop: 'total', 
        name: 'Total', 
        size: 120,
        readonly: true, // se calcula: costo de servicio + cantidades × precio del catálogo
        cellTemplate: (h: any, props: any) => {
          const fila = props.model as FilaLiquidacionGrid;
          const total = fila.total;
          if (!total) return '';
          // con observación de no pago, la SOT no se cobra: monto en rojo y tachado
          if (esNoPago(fila)) {
            return h('div', { class: 'flex flex-col items-end leading-tight', title: 'No se cobra: tiene observación de no pago' }, [
              h('span', { class: 'font-medium text-red-600 line-through' }, `S/ ${Number(fila.precioTotalEditable ?? total).toFixed(2)}`),
              h('span', { class: 'text-[11px] font-medium text-red-600' }, 'No pago'),
            ]);
          }
          // si Auditoría cambió el precio, se cobra ese y el calculado queda tachado
          if (fila.precioTotalEditable != null && Number(fila.precioTotalEditable) !== Number(total)) {
            return h('div', { class: 'flex flex-col items-end leading-tight' }, [
              h('span', { class: 'font-medium text-green-600' }, `S/ ${Number(fila.precioTotalEditable).toFixed(2)}`),
              h('span', { class: 'text-[11px] text-gray-400 line-through' }, `S/ ${Number(total).toFixed(2)}`),
            ]);
          }
          return h('span', { class: 'font-medium text-green-600' }, `S/ ${Number(total).toFixed(2)}`);
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