import type { ButtonHTMLAttributes, ReactNode, SelectHTMLAttributes, InputHTMLAttributes } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";

// ===== Estilo base de los controles (inputs, selects, textarea) =====
export const claseControl =
    "h-[30px] w-full rounded-control border border-line-input bg-surface px-2.5 text-sm text-ink transition-colors " +
    "hover:border-info focus:outline-2 focus:outline-offset-1 focus:outline-info " +
    "disabled:border-line disabled:bg-input-disabled disabled:text-muted disabled:cursor-not-allowed disabled:hover:border-line";

// ===== Campo: label arriba (termina en ":") + control abajo =====
export const Campo = ({ label, obligatorio = false, children, className = "" }: {
    label: string; obligatorio?: boolean; children: ReactNode; className?: string;
}) => (
    <label className={`flex min-w-0 flex-col gap-2 ${className}`}>
        <span className="text-sm text-label">
            {label.endsWith(":") ? label : `${label}:`}{obligatorio && <span className="text-required">*</span>}
        </span>
        {children}
    </label>
);

export const Entrada = ({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className={`${claseControl} ${className}`} />
);

// select nativo con el chevron propio a la derecha.
// Mientras el valor sea "" (Todos / Todas / Seleccione) se ve en cursiva gris, como un placeholder.
export const Selector = ({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="relative">
        <select
            {...props}
            className={`${claseControl} appearance-none pr-8 has-[option[value='']:checked]:italic has-[option[value='']:checked]:text-placeholder [&>option]:not-italic [&>option]:text-ink ${className}`}
        >
            {children}
        </select>
        <ChevronDown size={14} strokeWidth={1.75} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink" />
    </div>
);

// rango de fechas "dd/mm/aaaa – dd/mm/aaaa" en un solo control con el calendario a la derecha
export const RangoFechas = ({ desde, hasta, onDesde, onHasta }: {
    desde: string; hasta: string; onDesde: (v: string) => void; onHasta: (v: string) => void;
}) => {
    const claseFecha = `min-w-0 flex-1 bg-transparent outline-none [&::-webkit-calendar-picker-indicator]:hidden ${desde || hasta ? "" : "italic text-placeholder"}`;
    return (
        <div className="flex h-[30px] items-center gap-1 rounded-control border border-line-input bg-surface px-2.5 text-sm text-ink transition-colors hover:border-info focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-info">
            <input type="date" value={desde} max={hasta || undefined} onChange={(e) => onDesde(e.target.value)} className={claseFecha} aria-label="Desde" />
            <span className="text-placeholder">–</span>
            <input type="date" value={hasta} min={desde || undefined} onChange={(e) => onHasta(e.target.value)} className={claseFecha} aria-label="Hasta" />
            <CalendarDays size={16} strokeWidth={1.75} className="shrink-0 text-ink" />
        </div>
    );
};

// ===== Botones =====
// primario: rojo relleno (Buscar, Limpiar, Guardar, Nueva...)
// secundario: borde gris, para acciones de cancelar en formularios
// texto: ghost, sin borde ni fondo (acciones de tarjeta)
type Variante = "primario" | "secundario" | "texto";
const variantes: Record<Variante, string> = {
    primario: "bg-primary text-on-primary font-bold hover:bg-primary-hover active:bg-primary-active",
    secundario: "border border-line-input bg-surface text-ink font-medium hover:bg-hover",
    texto: "text-ink font-medium hover:bg-hover",
};

export const Boton = ({ variante = "primario", icono, children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {
    variante?: Variante; icono?: ReactNode;
}) => (
    <button
        type="button"
        {...props}
        className={`inline-flex h-[30px] items-center justify-center gap-1.5 rounded-control px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-info ${variantes[variante]} ${className}`}
    >
        {icono}{children}
    </button>
);
