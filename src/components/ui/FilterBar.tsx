import { useState, type ReactNode } from "react";
import { ChevronDown, Search, FilterX, SlidersHorizontal } from "lucide-react";
import { Boton } from "./Controles";

const CLAVE = "filterbar-fijo";

const leerFijo = () => {
    try { return localStorage.getItem(CLAVE) !== "0"; } catch { return true; }
};

// Panel de filtros: tarjeta blanca con grilla de 4 columnas (2 en tablet, 1 en móvil).
// Buscar y Limpiar ocupan cada uno una celda de la grilla, a continuación de los filtros.
// La cabecera permite ocultar/mostrar el panel (se recuerda por navegador).
export const FilterBar = ({ children, onBuscar, onLimpiar, hayFiltros = false }: {
    children: ReactNode; onBuscar: () => void; onLimpiar: () => void; hayFiltros?: boolean;
}) => {
    const [abierto, setAbierto] = useState(leerFijo);

    const alternar = () => {
        setAbierto((v) => {
            try { localStorage.setItem(CLAVE, v ? "0" : "1"); } catch { /* sin almacenamiento: solo en memoria */ }
            return !v;
        });
    };

    return (
        <section className="rounded-card bg-filters p-5 md:p-6">
            <header className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
                    <SlidersHorizontal size={18} strokeWidth={1.75} className="text-label" />
                    Filtros
                    {hayFiltros && <span className="h-2 w-2 rounded-pill bg-primary" aria-label="Hay filtros aplicados" />}
                </h2>
                <button
                    type="button"
                    onClick={alternar}
                    aria-expanded={abierto}
                    className="inline-flex items-center gap-1 rounded-pill px-3 py-1 text-sm font-medium text-label transition-colors hover:bg-hover hover:text-ink"
                >
                    {abierto ? "Ocultar" : "Mostrar"}
                    <ChevronDown size={16} strokeWidth={1.75} className={`transition-transform ${abierto ? "rotate-180" : ""}`} />
                </button>
            </header>

            {abierto && (
                <form
                    onSubmit={(e) => { e.preventDefault(); onBuscar(); }}
                    className="mt-4 grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {children}
                    <Boton type="submit" variante="suave" icono={<Search size={16} strokeWidth={1.75} />} className="w-full">Buscar</Boton>
                    <Boton variante="secundario" onClick={onLimpiar} icono={<FilterX size={16} strokeWidth={1.75} />} className="w-full" disabled={!hayFiltros}>Limpiar</Boton>
                </form>
            )}
        </section>
    );
};
