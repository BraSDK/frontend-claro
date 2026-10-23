// Píldora de estado.
// Para cambiar qué color lleva cada estado, edita solo MAPEO_ESTADOS.

export type Tono = "success" | "warning" | "danger" | "info" | "neutral";

// Píldora suave: fondo tenue del estado + texto y punto del color del estado (verde = positivo)
const estilos: Record<Tono, { pildora: string; punto: string }> = {
    success: { pildora: "bg-success-soft text-success", punto: "bg-success" },
    warning: { pildora: "bg-warning-soft text-warning", punto: "bg-warning" },
    danger: { pildora: "bg-danger-soft text-danger", punto: "bg-danger" },
    info: { pildora: "bg-primary-soft text-primary", punto: "bg-primary" },
    neutral: { pildora: "bg-page text-label", punto: "bg-muted" },
};

export const MAPEO_ESTADOS = {
    // estado de la orden de trabajo
    orden: {
        0: { label: "Ingresado", tono: "info" },
        1: { label: "Procesado", tono: "warning" },
        2: { label: "Liquidado", tono: "success" },
    },
    // estado de la SOT en el sistema de Claro (EstadoClaro de la orden de trabajo)
    campo: {
        0: { label: "Completado", tono: "success" },
        1: { label: "No completado", tono: "danger" },
        2: { label: "En progreso", tono: "warning" },
    },
    // estado de pago de la SOT
    pago: {
        0: { label: "Pendiente", tono: "warning" },
        1: { label: "Pagado", tono: "success" },
        2: { label: "No pagado", tono: "danger" },
    },
    // categoría de la conciliación
    conciliacion: {
        0: { label: "Cuadra", tono: "success" },
        1: { label: "Diferencia", tono: "warning" },
        2: { label: "No pagada", tono: "danger" },
        3: { label: "Por auditar", tono: "info" },
    },
} satisfies Record<string, Record<number, { label: string; tono: Tono }>>;

export const StatusBadge = ({ tono, children }: { tono: Tono; children: React.ReactNode }) => (
    <span className={`inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-badge px-2.5 text-xs font-semibold ${estilos[tono].pildora}`}>
        <span className={`h-1.5 w-1.5 shrink-0 rounded-pill ${estilos[tono].punto}`} aria-hidden />
        {children}
    </span>
);

// Atajo: badge a partir de un grupo del mapeo y su valor
export const EstadoMapeado = ({ grupo, valor }: { grupo: keyof typeof MAPEO_ESTADOS; valor: number }) => {
    const info = (MAPEO_ESTADOS[grupo] as Record<number, { label: string; tono: Tono }>)[valor];
    return info ? <StatusBadge tono={info.tono}>{info.label}</StatusBadge> : <StatusBadge tono="neutral">—</StatusBadge>;
};
