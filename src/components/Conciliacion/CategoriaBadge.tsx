import { CategoriaConciliacion } from "../../types/conciliacion.types";
import { StatusBadge, type Tono } from "../ui/StatusBadge";

// nombre y tono de cada categoría (verde cuadra, naranja diferencia, rojo no pagada, acento por auditar).
// pill/punto se usan en las pastillas de filtro de la conciliación.
const PILL: Record<Tono, { pill: string; punto: string }> = {
    success: { pill: "bg-success-soft text-success", punto: "bg-success" },
    warning: { pill: "bg-warning-soft text-warning", punto: "bg-warning" },
    danger: { pill: "bg-danger-soft text-danger", punto: "bg-danger" },
    info: { pill: "bg-primary-soft text-primary", punto: "bg-primary" },
    neutral: { pill: "bg-page text-label", punto: "bg-muted" },
};

const tonos: Record<CategoriaConciliacion, { label: string; tono: Tono }> = {
    [CategoriaConciliacion.CUADRA]: { label: "Cuadra", tono: "success" },
    [CategoriaConciliacion.DIFERENCIA]: { label: "Diferencia", tono: "warning" },
    [CategoriaConciliacion.NO_PAGADA]: { label: "No pagada", tono: "danger" },
    [CategoriaConciliacion.POR_AUDITAR]: { label: "Por auditar", tono: "info" },
};

export const CATEGORIAS = Object.fromEntries(
    Object.entries(tonos).map(([k, v]) => [k, { ...v, ...PILL[v.tono] }])
) as unknown as Record<CategoriaConciliacion, { label: string; tono: Tono; pill: string; punto: string }>;

export const CategoriaBadge = ({ categoria }: { categoria: CategoriaConciliacion }) => {
    const info = CATEGORIAS[categoria];
    return <StatusBadge tono={info.tono}>{info.label}</StatusBadge>;
};
