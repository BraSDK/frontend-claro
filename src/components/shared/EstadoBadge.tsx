// Un solo lugar para el nombre y los colores de cada estado de la orden
export const ESTADOS_ORDEN : Record<number,{label:string; className:string; barra:string}> = {

    0 : { label: "INGRESADO", className: "bg-amber-50 text-amber-700 ring-amber-600/20", barra: "bg-amber-400" },
    1 : { label: "PROCESADO", className: "bg-blue-50 text-blue-700 ring-blue-600/20",   barra: "bg-blue-500" },
    2 : { label: "LIQUIDADO", className: "bg-green-50 text-green-700 ring-green-600/20", barra: "bg-green-500" }

}

export function EstadoBadge({ estado }: { estado: number }) {
    const info = ESTADOS_ORDEN[estado] ?? { label: "Desconocido", className: "bg-slate-100 text-slate-600 ring-slate-500/20", barra: "bg-slate-400" };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${info.className}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${info.barra}`} />
            {info.label}
        </span>
    );
};
