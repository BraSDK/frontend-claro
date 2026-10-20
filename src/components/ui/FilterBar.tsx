import { useState, type ReactNode } from "react";
import { Pin, PinOff, Search, FilterX } from "lucide-react";
import { Boton } from "./Controles";

const CLAVE = "filterbar-fijo";

const leerFijo = () => {
    try { return localStorage.getItem(CLAVE) !== "0"; } catch { return true; }
};

// Panel de filtros a todo el ancho (se sale del padding del <main>): grilla de 4 columnas
// (2 en tablet, 1 en móvil); Buscar y Limpiar ocupan cada uno una celda de la grilla, a continuación de los filtros.
// El botón con el pin, sobre la línea inferior, colapsa o fija el panel (se recuerda por navegador).
export const FilterBar = ({ children, onBuscar, onLimpiar, hayFiltros = false }: {
    children: ReactNode; onBuscar: () => void; onLimpiar: () => void; hayFiltros?: boolean;
}) => {
    const [fijo, setFijo] = useState(leerFijo);

    const alternar = () => {
        setFijo((v) => {
            try { localStorage.setItem(CLAVE, v ? "0" : "1"); } catch { /* sin almacenamiento: solo en memoria */ }
            return !v;
        });
    };

    return (
        <section className="relative -mx-4 mb-2 bg-filters first:-mt-6 md:-mx-10 xl:-mx-20">
            {fijo && (
                <form
                    onSubmit={(e) => { e.preventDefault(); onBuscar(); }}
                    className="grid grid-cols-1 items-end gap-x-[18px] gap-y-4 px-4 pb-6 pt-5 sm:grid-cols-2 md:px-10 lg:grid-cols-4 xl:px-[90px]"
                >
                    {children}
                    <Boton type="submit" icono={<Search size={16} strokeWidth={1.75} />} className="w-full">Buscar</Boton>
                    <Boton onClick={onLimpiar} icono={<FilterX size={16} strokeWidth={1.75} />} className="w-full" disabled={!hayFiltros}>Limpiar</Boton>
                </form>
            )}

            {/* línea inferior con el pin centrado */}
            <div className={`relative h-px bg-line ${fijo ? "" : "mt-4"}`}>
                <button
                    type="button"
                    onClick={alternar}
                    title={fijo ? "Ocultar filtros" : "Mostrar filtros"}
                    aria-label={fijo ? "Ocultar filtros" : "Mostrar filtros"}
                    className="absolute left-1/2 top-1/2 z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line-input bg-surface text-ink transition-colors hover:bg-hover"
                >
                    {fijo ? <Pin size={14} strokeWidth={1.75} /> : <PinOff size={14} strokeWidth={1.75} />}
                </button>
            </div>
        </section>
    );
};
