// Formatos compartidos para montos, fechas y nombres

const soles = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 });

export const formatoSoles = (monto?: number | null) => soles.format(monto ?? 0);

// Las fechas vienen del back en UTC; se muestran como día calendario (sin correrse por la zona horaria)
export const formatoFecha = (iso?: string | null) => {
    if (!iso) return '-';
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) return '-';
    return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
};

export const NOMBRES_MES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// "FLORES MOLINA OMAR" -> "FM"
export const iniciales = (nombre?: string | null) =>
    (nombre ?? '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('') || '?';

export const NOMBRES_ROL: Record<string, string> = {
    ADMIN: 'Administrador',
    TECNICO: 'Técnico',
    ALMACEN: 'Almacén',
};

// Variación porcentual respecto al mes anterior (null si no hay base para comparar)
export const variacion = (actual: number, anterior: number): number | null =>
    anterior === 0 ? null : ((actual - anterior) / anterior) * 100;

// 2026-09-05T00:00:00Z -> "05/09/2026"
export const formatoFechaCorta = (iso?: string | null) => {
    if (!iso) return '-';
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) return '-';
    return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
};

// 12 sep. 2026 · 10:24 a. m.
export const formatoFechaHora = (iso?: string | null) => {
    if (!iso) return '-';
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) return '-';
    const dia = fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
    const hora = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    return `${dia} · ${hora}`;
};

// diferencia con signo: "+ S/ 10.00", "- S/ 20.00", "S/ 0.00"
export const formatoDiferencia = (monto?: number | null) => {
    if (monto === null || monto === undefined) return '—';
    if (monto === 0) return formatoSoles(0);
    return `${monto > 0 ? '+' : '-'} ${formatoSoles(Math.abs(monto))}`;
};
