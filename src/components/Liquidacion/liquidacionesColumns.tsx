import type { ColumnRegular } from '@revolist/react-datagrid';
import type { FilaLiquidacionGrid } from '../../types/liquidacion.types';

export const getLiquidacionesColumns = (
    onDelete?: (sot: number) => void
  ): ColumnRegular[] => [
    { 
      prop: 'sot', 
      name: 'SOT', 
      size: 100,
      cellTemplate: (h: any, props: any) => {
        const sot = props.model[props.prop];
        return h('span', { class: 'font-mono text-sm' }, sot || '');
      }
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
        // Al editar, el usuario ingresará 'YYYY-MM-DD', aquí lo formateamos visualmente
        cellTemplate: (h: any, props: any) => {
          const fecha = props.model[props.prop];
          if (!fecha) return '';
          
          const parsed = new Date(fecha);
          // Si la fecha es inválida para JavaScript, retornamos el texto crudo
          if (isNaN(parsed.getTime())) {
              return h('span', {}, fecha); 
          }
          // Si es válida, la formateamos
          return h('span', {}, parsed.toLocaleDateString());
        }
    },
    { prop: 'subTipoOrden', name: 'SubTipo Orden', size: 160},
    
    // --- BAREMOS Y MATERIALES (Cantidades / Precios) ---
    { prop: 'costoServicio', name: 'Costo Servicio', size: 120 },
    { prop: 'deco', name: 'Deco', size: 80 },
    { prop: 'repetidor', name: 'Repetidor', size: 100 },
    { prop: 'drop150', name: 'Drop 150', size: 90 },
    { prop: 'drop220', name: 'Drop 220', size: 90 },
    { prop: 'drop300', name: 'Drop 300', size: 90 },

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