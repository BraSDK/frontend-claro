// Estado de auditoría de una SOT en los pagos de Claro (1 Pagó, 2 No pagó, 3 Incompleto)
const ESTILOS: Record<number, { texto: string; clase: string }> = {
    1: { texto: 'Pagó', clase: 'bg-success-soft text-success' },
    2: { texto: 'No pagó', clase: 'bg-danger-soft text-danger' },
    3: { texto: 'Incompleto', clase: 'bg-warning-soft text-warning' },
};

export const EstadoPagoTexto = ({ estado }: { estado: number }) => {
    const e = ESTILOS[estado] ?? { texto: '—', clase: 'bg-hover text-muted' };
    return <span className={`inline-block rounded-badge px-2.5 py-0.5 text-xs font-medium ${e.clase}`}>{e.texto}</span>;
};
