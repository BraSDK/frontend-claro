import { MAPEO_ESTADOS, StatusBadge } from "../ui/StatusBadge";

// Nombre y color de cada estado de la orden. Los colores salen del mapeo de StatusBadge (un solo lugar).
// "barra" se usa en los gráficos del Dashboard.
const BARRA = { success: "bg-success", warning: "bg-warning", danger: "bg-danger", info: "bg-info", neutral: "bg-muted" } as const;

export const ESTADOS_ORDEN: Record<number, { label: string; barra: string }> = Object.fromEntries(
    Object.entries(MAPEO_ESTADOS.orden).map(([valor, info]) => [valor, { label: info.label.toUpperCase(), barra: BARRA[info.tono] }])
);

export function EstadoBadge({ estado }: { estado: number }) {
    const info = MAPEO_ESTADOS.orden[estado as 0 | 1 | 2];
    return info
        ? <StatusBadge tono={info.tono}>{info.label}</StatusBadge>
        : <StatusBadge tono="neutral">Desconocido</StatusBadge>;
};
