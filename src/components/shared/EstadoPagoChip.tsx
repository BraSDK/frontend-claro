import { EstadoPago } from "../../types/conciliacion.types";
import { StatusBadge, type Tono } from "../ui/StatusBadge";

// Nombre y tono de cada estado de pago: Pendiente (neutro), Sí pago (verde), No pago (rojo)
export const ESTADOS_PAGO: Record<EstadoPago, { label: string; tono: Tono }> = {
    [EstadoPago.Pendiente]: { label: "Pendiente", tono: "neutral" },
    [EstadoPago.SiPago]: { label: "Sí pago", tono: "success" },
    [EstadoPago.NoPago]: { label: "No pago", tono: "danger" },
};

interface Props {
    estado?: EstadoPago;
    motivo?: string | null;   // en No pago se muestra como tooltip
}

export const EstadoPagoChip = ({ estado = EstadoPago.Pendiente, motivo }: Props) => {
    const info = ESTADOS_PAGO[estado] ?? ESTADOS_PAGO[EstadoPago.Pendiente];
    const conMotivo = estado === EstadoPago.NoPago && !!motivo;
    return (
        <span title={conMotivo ? `Motivo: ${motivo}` : undefined} className={conMotivo ? "cursor-help" : undefined}>
            <StatusBadge tono={info.tono}>{info.label}</StatusBadge>
        </span>
    );
};
