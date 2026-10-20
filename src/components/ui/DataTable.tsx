import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ChevronRight } from "lucide-react";

// ===== Estilos de tabla tipo grilla (todas las líneas visibles), para que todas las tablas se vean igual =====
// Se usa border-separate + spacing 0 para que los bordes acompañen a las columnas fijas (sticky):
// la tabla pone el borde superior/izquierdo y cada celda su borde derecho/inferior.
export const claseTabla = "w-full min-w-max border-separate border-spacing-0 border-l border-t border-line-soft text-sm";
export const claseTh =
    "sticky top-0 z-20 h-[37px] whitespace-nowrap border-b border-r border-b-line-strong border-r-line-soft bg-surface px-3 text-center text-[15px] font-bold text-ink";
export const claseTd =
    "h-[37px] whitespace-nowrap border-b border-r border-line-soft px-3 text-center text-sm text-ink-cell";
export const claseFila = "bg-surface transition-colors hover:bg-hover";
export const claseFilaSeleccionada = "bg-selected";
// checkbox de 18px de la primera columna
export const claseCheckbox = "h-[18px] w-[18px] cursor-pointer rounded-[3px] accent-ink disabled:cursor-not-allowed disabled:opacity-30";
// borde que separa las columnas fijas del resto
export const claseFinFijas = "border-r-line-fixed";

// Tarjeta blanca: cabecera (título con contador + acciones), tabla con scroll propio y pie
export const DataTable = ({ titulo, cantidad, acciones, children, pie }: {
    titulo: string; cantidad?: number; acciones?: ReactNode; children: ReactNode; pie?: ReactNode;
}) => (
    <section className="overflow-hidden rounded-card bg-surface px-4 py-4 shadow-card md:px-6">
        <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[17px] font-bold text-ink">
                {titulo}{cantidad !== undefined && ` (${cantidad})`}
            </h2>
            {acciones && <div className="flex flex-wrap items-center gap-2 md:gap-4">{acciones}</div>}
        </header>
        {/* scroll horizontal y vertical dentro de la tarjeta: el encabezado queda fijo */}
        <div className="max-h-[65vh] overflow-auto">{children}</div>
        {pie}
    </section>
);

// Acción de la cabecera de la tarjeta: ghost, ícono outline + texto
export const AccionTabla = ({ icono, children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icono?: ReactNode }) => (
    <button
        type="button"
        {...props}
        className={`inline-flex h-[30px] items-center gap-1.5 rounded-control px-2 text-sm font-medium text-ink transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
        {icono}{children}
    </button>
);

// Filas vacías con la grilla, para que la tabla nunca se vea "cortada" cuando hay pocos registros
export const FilasRelleno = ({ actuales, minimo = 10, columnas }: { actuales: number; minimo?: number; columnas: number }) => (
    <>
        {Array.from({ length: Math.max(0, minimo - actuales) }).map((_, i) => (
            <tr key={`relleno-${i}`} className="bg-surface" aria-hidden>
                {Array.from({ length: columnas }).map((__, j) => <td key={j} className={claseTd} />)}
            </tr>
        ))}
    </>
);

// Chevron de la última columna: lleva al detalle del registro
export const CeldaChevron = ({ onClick, titulo = "Ver detalle" }: { onClick: () => void; titulo?: string }) => (
    <button
        type="button"
        onClick={onClick}
        title={titulo}
        aria-label={titulo}
        className="inline-flex h-7 w-7 items-center justify-center rounded-control text-ink transition-colors hover:bg-hover"
    >
        <ChevronRight size={18} strokeWidth={1.75} />
    </button>
);
