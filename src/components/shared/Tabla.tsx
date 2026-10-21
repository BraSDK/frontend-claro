import React from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

export const claseTabla = "w-full min-w-max border-separate border-spacing-0 border-l border-t border-gray-200 text-sm";
export const claseTh = "sticky top-0 z-20 h-[37px] whitespace-nowrap border-b border-r border-gray-300 bg-gray-50 px-3 text-center text-[15px] font-bold text-gray-800";
export const claseTd = "h-[37px] whitespace-nowrap border-b border-r border-gray-200 px-3 text-center text-sm text-gray-700";
export const claseFila = "bg-white transition-colors hover:bg-gray-50";

export const FilasRelleno = ({ actuales, minimo = 10, columnas }: { actuales: number; minimo?: number; columnas: number }) => (
    <>
        {Array.from({ length: Math.max(0, minimo - actuales) }).map((_, i) => (
            <tr key={`relleno-${i}`} className={claseFila} aria-hidden>
                {Array.from({ length: columnas }).map((__, j) => (
                    <td key={`celda-${i}-${j}`} className={claseTd} />
                ))}
            </tr>
        ))}
    </>
);

export const DataTable = ({ titulo, cantidad, acciones, children, pie }: {
    titulo: string; cantidad?: number; acciones?: ReactNode; children: ReactNode; pie?: ReactNode;
}) => (
    <section className="overflow-hidden rounded-lg bg-white px-4 py-4 shadow-sm border border-gray-200 md:px-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[17px] font-bold text-gray-900">
                {titulo}{cantidad !== undefined && ` (${cantidad})`}
            </h2>
            {acciones && <div className="flex flex-wrap items-center gap-2 md:gap-4">{acciones}</div>}
        </header>
        <div className="max-h-[65vh] overflow-auto border border-gray-200 rounded-md">
            {children}
        </div>
        {pie && <div className="mt-4">{pie}</div>}
    </section>
);

export const AccionTabla = ({ icono, children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icono?: ReactNode }) => (
    <button
        type="button"
        {...props}
        className={`inline-flex h-[32px] items-center gap-1.5 rounded-md px-3 text-sm font-medium text-gray-700 border border-transparent transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
        {icono}{children}
    </button>
);

export const Boton = ({ icono, children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icono?: ReactNode }) => (
    <button
        type="button"
        {...props}
        className={`inline-flex h-[32px] items-center gap-1.5 rounded-md bg-red-600 px-3 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
        {icono}{children}
    </button>
);

export const BarPaginancion = ({ onHandle, numeroPagina, totalRegistros, totalRegistrosPagina, totalPaginasTotales }: {
    onHandle: (pagina: number) => void; numeroPagina: number; totalRegistros: number; totalRegistrosPagina: number; totalPaginasTotales: number;
}) => (
    <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
            Mostrando {Math.min((numeroPagina - 1) * totalRegistrosPagina + 1, totalRegistros)} a {Math.min(numeroPagina * totalRegistrosPagina, totalRegistros)} de {totalRegistros} registros
        </div>
        <div className="flex items-center gap-1">
            <button 
                onClick={() => onHandle(numeroPagina - 1)} 
                disabled={numeroPagina <= 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            >
                <ChevronLeft size={18} />
            </button>
            <span className="px-2 font-medium">Página {numeroPagina} de {totalPaginasTotales}</span>
            <button 
                onClick={() => onHandle(numeroPagina + 1)} 
                disabled={numeroPagina >= totalPaginasTotales}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    </div>
);