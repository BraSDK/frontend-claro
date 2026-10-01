import { EstadoPago } from "../../types/Ordenes";

// Nombre y colores de cada estado de pago: Pendiente (gris), Sí pago (verde), No pago (rojo)
export const ESTADOS_PAGO: Record<EstadoPago, { label: string; className: string; punto: string }> = {
    [EstadoPago.Pendiente]: { label: "Pendiente", className: "bg-slate-100 text-slate-600 ring-slate-500/15", punto: "bg-slate-400" },
    [EstadoPago.SiPago]:    { label: "Sí pago",   className: "bg-green-50 text-green-700 ring-green-600/15",  punto: "bg-green-500" },
    [EstadoPago.NoPago]:    { label: "No pago",   className: "bg-red-50 text-red-700 ring-red-600/15",        punto: "bg-red-500" },
};

interface Props {
    estado?: EstadoPago;
    motivo?: string | null;   // en No pago se muestra como tooltip
}

export const EstadoPagoChip = ({ estado = EstadoPago.Pendiente, motivo }: Props) => {
    const info = ESTADOS_PAGO[estado] ?? ESTADOS_PAGO[EstadoPago.Pendiente];
    return (
        <span
            title={estado === EstadoPago.NoPago && motivo ? `Motivo: ${motivo}` : undefined}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${info.className} ${estado === EstadoPago.NoPago && motivo ? "cursor-help" : ""}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${info.punto}`} />
            {info.label}
        </span>
    );
};
