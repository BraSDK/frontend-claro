import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ChevronRight } from "lucide-react";

// ===== Estilos de tabla (líneas finas Border Mist en toda la grilla), para que todas las tablas se vean igual =====
// Se usa border-separate + spacing 0 para que los bordes acompañen a las columnas fijas (sticky).
// El contenedor redondeado pone el marco; cada celda su borde derecho/inferior (sin duplicar en los extremos).
export const claseTabla =
    "w-full min-w-max border-separate border-spacing-0 text-sm [&_tr>*:last-child]:border-r-0 [&_tbody_tr:last-child>td]:border-b-0";
export const claseTh =
    "sticky top-0 z-20 h-11 whitespace-nowrap border-b border-r border-line bg-page px-4 text-center text-sm font-semibold text-ink";
export const claseTd =
    "h-11 whitespace-nowrap border-b border-r border-line px-4 text-center text-sm text-ink-cell";
export const claseFila = "bg-surface transition-colors hover:bg-hover";
export const claseFilaSeleccionada = "bg-selected";
// checkbox de 18px de la primera columna
export const claseCheckbox = "h-[18px] w-[18px] cursor-pointer rounded-[4px] accent-primary disabled:cursor-not-allowed disabled:opacity-30";
// borde que separa las columnas fijas del resto
export const claseFinFijas = "border-r-line-fixed";

// Contador del título: píldora suave
export const Contador = ({ valor }: { valor: number }) => (
    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-pill bg-primary-soft px-2 text-xs font-semibold text-primary tabular-nums">
        {valor}
    </span>
);

// Tarjeta blanca (24px de radio, plana): cabecera (título + contador + acciones), tabla con scroll propio y pie
export const DataTable = ({ titulo, cantidad, acciones, children, pie }: {
    titulo: string; cantidad?: number; acciones?: ReactNode; children: ReactNode; pie?: ReactNode;
}) => (
    <section className="rounded-card bg-surface p-5 md:p-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2.5 text-lg font-semibold text-ink">
                {titulo}{cantidad !== undefined && <Contador valor={cantidad} />}
            </h2>
            {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
        </header>
        {/* scroll horizontal y vertical dentro de la tarjeta: el encabezado queda fijo */}
        <div className="max-h-[65vh] overflow-auto rounded-mid border border-line">{children}</div>
        {pie}
    </section>
);

// Acción de la cabecera de la tarjeta: ghost en píldora, ícono outline + texto
export const AccionTabla = ({ icono, children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icono?: ReactNode }) => (
    <button
        type="button"
        {...props}
        className={`inline-flex h-10 items-center gap-2 rounded-pill px-4 text-sm font-medium text-label transition-colors hover:bg-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
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
        className="inline-flex h-8 w-8 items-center justify-center rounded-pill text-label transition-colors hover:bg-primary-soft hover:text-primary"
    >
        <ChevronRight size={18} strokeWidth={1.75} />
    </button>
);
