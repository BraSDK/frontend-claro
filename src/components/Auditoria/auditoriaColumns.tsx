import type { ColumnRegular } from '@revolist/react-datagrid';
import { ESTADOS_PAGO_LIQ, ETIQUETAS_PAGO, type FilaAuditoria } from '../../types/auditoria.types';
import { aNumero } from '../../utils/leerExcel';
import { formatoSoles } from '../../utils/formato';

// Total que se cobra: el editado si lo hay, si no el calculado
export const totalACobrar = (f: Partial<FilaAuditoria>) => aNumero(f.precioEditado) ?? Number(f.precioTotalReal ?? 0);

const celda = 'flex h-full w-full flex-col items-end justify-center leading-tight';

export const getAuditoriaColumns = (): ColumnRegular[] => [
    {
        prop: 'sot', name: 'SOT', size: 110, readonly: true, pin: 'colPinStart',
        cellTemplate: (h: any, props: any) => h('span', { class: 'font-mono text-sm' }, props.model.sot ?? ''),
    },
    { prop: 'tecnico', name: 'Técnico', size: 200, readonly: true },
    {
        prop: 'fechaProgramacion', name: 'F. Programación', size: 130, readonly: true,
        cellTemplate: (h: any, props: any) => {
            const iso = String(props.model.fechaProgramacion ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/);
            return h('span', {}, iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : '');
        },
    },
    {
        // Se edita el precio a cobrar; el calculado por el sistema no se toca.
        // Si son distintos: el editado grande arriba y el calculado tachado abajo.
        prop: 'precioEditado', name: 'Total a cobrar', size: 150,
        cellTemplate: (h: any, props: any) => {
            const real = Number(props.model.precioTotalReal ?? 0);
            const editado = aNumero(props.model.precioEditado);
            if (editado === null || editado === real) {
                return h('div', { class: celda }, h('span', { class: 'text-sm text-ink' }, formatoSoles(real)));
            }
            return h('div', { class: celda, title: 'Precio editado (el tachado es el calculado por el sistema)' }, [
                h('span', { class: 'text-[15px] font-bold text-ink' }, formatoSoles(editado)),
                h('span', { class: 'text-xs text-muted line-through' }, formatoSoles(real)),
            ]);
        },
    },
    {
        prop: 'montoPagado', name: 'Pagado', size: 130,
        cellTemplate: (h: any, props: any) => {
            const pagado = aNumero(props.model.montoPagado);
            return h('div', { class: celda }, h('span', { class: 'text-sm' }, pagado === null ? '' : formatoSoles(pagado)));
        },
    },
    {
        prop: 'diferencia', name: 'Diferencia', size: 130, readonly: true,
        cellTemplate: (h: any, props: any) => {
            const pagado = aNumero(props.model.montoPagado);
            if (pagado === null) return '';
            const dif = pagado - totalACobrar(props.model);
            const color = Math.abs(dif) < 0.01 ? 'text-muted' : dif < 0 ? 'text-danger font-semibold' : 'text-success font-semibold';
            return h('div', { class: celda }, h('span', { class: `text-sm ${color}` }, formatoSoles(dif)));
        },
    },
    {
        prop: 'estado', name: 'Estado de pago', size: 150,
        columnType: 'select',
        source: ETIQUETAS_PAGO,
        cellTemplate: (h: any, props: any) => {
            const estado = ESTADOS_PAGO_LIQ.find((e) => e.label === props.model.estado);
            if (!estado) return props.model.estado ?? '';   // texto pegado que no es un estado: se ve tal cual
            return h('span', {
                class: `inline-flex h-5 items-center whitespace-nowrap rounded-badge px-2 text-[13px] font-bold leading-5 text-white ${estado.clase}`,
            }, estado.label);
        },
    },
];
