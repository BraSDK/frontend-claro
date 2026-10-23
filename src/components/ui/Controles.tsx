import type { ButtonHTMLAttributes, ReactNode, SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";

// ===== Estilo base de los controles (inputs, selects, textarea) =====
// 40px de alto, radio 8px, borde Border Mist; al enfocar, anillo de 2px del acento (sin sombra)
export const claseControl =
    "h-10 w-full rounded-control border border-line-input bg-surface px-3 text-sm text-ink transition-colors " +
    "hover:border-line-fixed focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary " +
    "disabled:bg-input-disabled disabled:text-muted disabled:cursor-not-allowed disabled:hover:border-line-input";

// ===== Campo: label arriba + control abajo =====
export const Campo = ({ label, obligatorio = false, children, className = "" }: {
    label: string; obligatorio?: boolean; children: ReactNode; className?: string;
}) => (
    <label className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
        <span className="text-sm font-medium text-label">
            {label.replace(/:$/, "")}{obligatorio && <span className="ml-0.5 text-required">*</span>}
        </span>
        {children}
    </label>
);

export const Entrada = ({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className={`${claseControl} ${className}`} />
);

// texto largo: mismo estilo que los inputs, con alto libre
export const AreaTexto = ({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} className={`${claseControl} h-auto min-h-[88px] resize-y py-2.5 leading-normal ${className}`} />
);

// select nativo con el chevron propio a la derecha.
// Mientras el valor sea "" (Todos / Todas / Seleccione) se ve en gris, como un placeholder.
export const Selector = ({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="relative">
        <select
            {...props}
            className={`${claseControl} appearance-none pr-9 has-[option[value='']:checked]:text-placeholder [&>option]:text-ink ${className}`}
        >
            {children}
        </select>
        <ChevronDown size={16} strokeWidth={1.75} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-label" />
    </div>
);

// rango de fechas "dd/mm/aaaa – dd/mm/aaaa" en un solo control con el calendario a la derecha
export const RangoFechas = ({ desde, hasta, onDesde, onHasta }: {
    desde: string; hasta: string; onDesde: (v: string) => void; onHasta: (v: string) => void;
}) => {
    const claseFecha = `min-w-0 flex-1 bg-transparent outline-none [&::-webkit-calendar-picker-indicator]:hidden ${desde || hasta ? "" : "text-placeholder"}`;
    return (
        <div className="flex h-10 items-center gap-1.5 rounded-control border border-line-input bg-surface px-3 text-sm text-ink transition-colors hover:border-line-fixed focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary">
            <input type="date" value={desde} max={hasta || undefined} onChange={(e) => onDesde(e.target.value)} className={claseFecha} aria-label="Desde" />
            <span className="text-placeholder">–</span>
            <input type="date" value={hasta} min={desde || undefined} onChange={(e) => onHasta(e.target.value)} className={claseFecha} aria-label="Hasta" />
            <CalendarDays size={16} strokeWidth={1.75} className="shrink-0 text-label" />
        </div>
    );
};

// ===== Botones (siempre píldora) =====
// primario:   degradado de marca. UNA sola acción principal por pantalla (Nueva orden, Guardar...)
// suave:      Soft Blue Wash con texto del acento. Acciones frecuentes que no son la principal (Buscar)
// secundario: blanco con borde fino (Cancelar, Volver, Limpiar)
// texto:      ghost, sin borde ni fondo (acciones de tarjeta)
type Variante = "primario" | "suave" | "secundario" | "texto";
const variantes: Record<Variante, string> = {
    primario: "bg-brand text-on-primary font-semibold hover:brightness-105 active:brightness-95",
    suave: "bg-primary-soft text-primary font-semibold hover:bg-primary-soft/70",
    secundario: "border border-line-input bg-surface text-ink font-medium hover:bg-hover",
    texto: "text-label font-medium hover:bg-hover hover:text-ink",
};

export const Boton = ({ variante = "primario", icono, children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {
    variante?: Variante; icono?: ReactNode;
}) => (
    <button
        type="button"
        {...props}
        className={`inline-flex h-10 items-center justify-center gap-2 rounded-pill px-5 text-sm transition disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${variantes[variante]} ${className}`}
    >
        {icono}{children}
    </button>
);
