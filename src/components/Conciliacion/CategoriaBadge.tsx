import { CategoriaConciliacion } from "../../types/conciliacion.types";

// nombre y colores de cada categoría (verde cuadra, naranja diferencia, rojo no pagada, violeta por auditar)
export const CATEGORIAS: Record<CategoriaConciliacion, { label: string; badge: string; punto: string; pill: string }> = {
    [CategoriaConciliacion.CUADRA]:      { label: "Cuadra",      badge: "bg-green-50 text-green-700 ring-green-600/15",   punto: "bg-green-500",  pill: "bg-green-50 text-green-700" },
    [CategoriaConciliacion.DIFERENCIA]:  { label: "Diferencia",  badge: "bg-orange-50 text-orange-700 ring-orange-600/15", punto: "bg-orange-500", pill: "bg-orange-50 text-orange-700" },
    [CategoriaConciliacion.NO_PAGADA]:   { label: "No pagada",   badge: "bg-rose-50 text-rose-700 ring-rose-600/15",      punto: "bg-rose-500",   pill: "bg-rose-50 text-rose-700" },
    [CategoriaConciliacion.POR_AUDITAR]: { label: "Por auditar", badge: "bg-violet-50 text-violet-700 ring-violet-600/15", punto: "bg-violet-500", pill: "bg-violet-50 text-violet-700" },
};

export const CategoriaBadge = ({ categoria }: { categoria: CategoriaConciliacion }) => {
    const info = CATEGORIAS[categoria];
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${info.badge}`}>
            {info.label}
        </span>
    );
};
