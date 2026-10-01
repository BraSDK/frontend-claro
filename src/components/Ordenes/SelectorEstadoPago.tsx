import { useId, useState } from "react";
import { Check, X } from "lucide-react";
import { ModalSmall } from "../shared/ModalSmall";
import { EstadoPagoChip } from "../shared/EstadoPagoChip";
import { useAuditoriaPago } from "../../hooks/ordenes/useAuditoriaPago";
import { EstadoPago, MOTIVOS_NO_PAGO, type AuditoriaPagoResponse } from "../../types/Ordenes";

interface Props {
    ordenId: number;
    sot: number;
    estadoPago?: EstadoPago;
    motivoNoPago?: string | null;
    onGuardado: (respuesta: AuditoriaPagoResponse) => void;
}

const claseCampo = "w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

// Dos botones (no un checkbox): así se distingue "No pago" de "Pendiente".
// "No pago" pide el motivo en un ModalSmall antes de guardar.
export const SelectorEstadoPago = ({ ordenId, sot, estadoPago = EstadoPago.Pendiente, motivoNoPago, onGuardado }: Props) => {
    const formId = useId();
    const { guardarEstadoPago, guardando, error, limpiarError } = useAuditoriaPago();
    const [modalAbierto, setModalAbierto] = useState(false);
    const [motivo, setMotivo] = useState("");
    const [observacion, setObservacion] = useState("");

    const marcarSiPago = async () => {
        const respuesta = await guardarEstadoPago(ordenId, { estadoPago: EstadoPago.SiPago });
        if (respuesta) onGuardado(respuesta);
    };

    const abrirNoPago = () => {
        setMotivo(motivoNoPago ?? "");
        setObservacion("");
        limpiarError();
        setModalAbierto(true);
    };

    const confirmarNoPago = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!motivo) return;
        const respuesta = await guardarEstadoPago(ordenId, {
            estadoPago: EstadoPago.NoPago,
            motivoNoPago: motivo,
            observacionPago: observacion.trim() || null,
        });
        if (respuesta) {
            setModalAbierto(false);
            onGuardado(respuesta);
        }
    };

    const boton = (activo: boolean, color: "green" | "red") =>
        `flex h-7 items-center gap-1 rounded-md px-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
            activo
                ? color === "green" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                : color === "green" ? "text-green-700 hover:bg-green-50" : "text-red-700 hover:bg-red-50"
        }`;

    return (
        <div className="flex flex-col items-start gap-1.5">
            <EstadoPagoChip estado={estadoPago} motivo={motivoNoPago} />
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
                <button
                    type="button"
                    onClick={marcarSiPago}
                    disabled={guardando || estadoPago === EstadoPago.SiPago}
                    className={boton(estadoPago === EstadoPago.SiPago, "green")}
                    title="Claro paga esta SOT"
                >
                    <Check size={13} /> Sí pago
                </button>
                <button
                    type="button"
                    onClick={abrirNoPago}
                    disabled={guardando}
                    className={boton(estadoPago === EstadoPago.NoPago, "red")}
                    title="Claro no paga esta SOT (pide el motivo)"
                >
                    <X size={13} /> No pago
                </button>
            </div>
            {error && !modalAbierto && <span className="text-xs text-red-600">{error}</span>}

            {modalAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !guardando && setModalAbierto(false)}>
                    <div className="w-full max-w-md text-left" onClick={(e) => e.stopPropagation()}>
                        <ModalSmall
                            title={`No pago · SOT ${sot}`}
                            isOpen={modalAbierto}
                            onClose={() => setModalAbierto(false)}
                            formId={formId}
                            submitLabel={guardando ? "Guardando..." : "Guardar"}
                        >
                            <form id={formId} onSubmit={confirmarNoPago} className="space-y-4">
                                <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                                    Motivo <span className="sr-only">(obligatorio)</span>
                                    <select required value={motivo} onChange={(e) => setMotivo(e.target.value)} className={`${claseCampo} h-11`}>
                                        <option value="">Selecciona un motivo...</option>
                                        {MOTIVOS_NO_PAGO.map((m) => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                                    Observación <span className="text-xs font-normal text-slate-400">(opcional)</span>
                                    <textarea
                                        rows={3}
                                        maxLength={500}
                                        value={observacion}
                                        onChange={(e) => setObservacion(e.target.value)}
                                        placeholder="Detalle adicional para almacén o para la apelación"
                                        className={`${claseCampo} resize-none py-2.5 font-normal`}
                                    />
                                </label>
                                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                                    La SOT quedará como <strong>No pago</strong>: Claro paga S/ 0.00.
                                </p>
                                {error && <p className="text-sm text-red-600">{error}</p>}
                            </form>
                        </ModalSmall>
                    </div>
                </div>
            )}
        </div>
    );
};
