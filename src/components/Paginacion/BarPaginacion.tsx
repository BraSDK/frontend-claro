import {ChevronLeft,ChevronRight} from 'lucide-react'

interface props  {
        totalRegistros : number,
        totalRegistrosPagina? : number,
        numeroPagina : number,
        totalPaginasTotales : number,
        onHandle : (numPag : number ) => void,
        acento? : 'red' | 'blue'   // obsoleto: la página activa siempre usa el acento suave
}

// Devuelve las páginas a mostrar con "..." cuando son muchas: 1 … 4 5 6 … 12
const paginasVisibles = (actual: number, total: number): (number | "...")[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const paginas: (number | "...")[] = [1];
    const desde = Math.max(2, actual - 1);
    const hasta = Math.min(total - 1, actual + 1);
    if (desde > 2) paginas.push("...");
    for (let p = desde; p <= hasta; p++) paginas.push(p);
    if (hasta < total - 1) paginas.push("...");
    paginas.push(total);
    return paginas;
};

export const BarPaginancion = ({totalPaginasTotales,numeroPagina,totalRegistrosPagina = 0,totalRegistros,onHandle} : props) => {
    const total = Math.max(1, totalPaginasTotales);
    const ir = (p: number) => { if (p >= 1 && p <= total && p !== numeroPagina) onHandle(p); };

    return(
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-label">
                    Mostrando <span className="font-medium text-ink">{totalRegistrosPagina}</span> de{" "}
                    <span className="font-medium text-ink">{totalRegistros}</span> {totalRegistros === 1 ? "orden" : "órdenes"}
                </p>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => ir(numeroPagina - 1)}
                        disabled={numeroPagina <= 1}
                        className="flex h-9 w-9 items-center justify-center rounded-pill text-label transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
                        title="Anterior"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {paginasVisibles(numeroPagina, total).map((p, i) =>
                        p === "..." ? (
                            <span key={`sep-${i}`} className="px-1 text-xs text-muted">…</span>
                        ) : (
                            <button
                                key={p}
                                type="button"
                                onClick={() => ir(p)}
                                className={`flex h-9 min-w-9 items-center justify-center rounded-pill px-3 text-sm font-semibold transition-colors ${
                                    p === numeroPagina ? "bg-primary-soft text-primary" : "text-label hover:bg-hover"
                                }`}
                            >
                                {p}
                            </button>
                        )
                    )}

                    <button
                        type="button"
                        onClick={() => ir(numeroPagina + 1)}
                        disabled={numeroPagina >= total}
                        className="flex h-9 w-9 items-center justify-center rounded-pill text-label transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
                        title="Siguiente"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
    );
}
