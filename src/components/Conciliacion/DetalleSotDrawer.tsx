import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Calendar, User, Wrench, Image as ImageIcon, ImageOff, Megaphone, CheckCircle2, ClipboardCheck, ChevronRight } from "lucide-react";
import { obtenerOrdenPorSot, urlArchivo } from "../../services/Ordenes/OrdenesTrabajo.service";
import type { OrdenTrabajo } from "../../types/Ordenes";
import { CategoriaConciliacion, type FilaConciliacion } from "../../types/conciliacion.types";
import { CategoriaBadge } from "./CategoriaBadge";
import { EstadoPagoChip } from "../shared/EstadoPagoChip";
import { formatoDiferencia, formatoFechaCorta, formatoSoles } from "../../utils/formato";

// filas de la valorización: tipo de detalle -> nombre (enum TipoDetalle del back)
const LINEAS_VALORIZACION: { tipo: number; label: string }[] = [
    { tipo: 0, label: "Costo" },
    { tipo: 1, label: "Adicional" },
    { tipo: 2, label: "Cableado 150" },
    { tipo: 3, label: "Cableado 220" },
    { tipo: 4, label: "Cableado 300" },
];

interface Props {
    fila: FilaConciliacion;
    onClose: () => void;
    onApelacion: (ordenId: number, marcar: boolean) => Promise<void>;
}

const Fila = ({ etiqueta, children, destacada = false }: { etiqueta: string; children: React.ReactNode; destacada?: boolean }) => (
    <div className={`flex items-center justify-between px-3 py-2 text-sm ${destacada ? "rounded-control bg-primary-soft font-semibold text-primary" : "text-label"}`}>
        <span>{etiqueta}</span>
        <span className={destacada ? "" : "font-medium text-ink"}>{children}</span>
    </div>
);

export const DetalleSotDrawer = ({ fila, onClose, onApelacion }: Props) => {
    const navigate = useNavigate();
    const [orden, setOrden] = useState<OrdenTrabajo | null>(null);
    const [guardandoApelacion, setGuardandoApelacion] = useState(false);

    useEffect(() => {
        setOrden(null);
        // la evidencia es de la orden de trabajo del técnico (se ubica por SOT)
        obtenerOrdenPorSot(fila.sot).then(setOrden).catch(() => setOrden(null));
    }, [fila.sot]);

    // cerrar con Escape
    useEffect(() => {
        const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", tecla);
        return () => window.removeEventListener("keydown", tecla);
    }, [onClose]);

    // los montos por tipo están en la liquidación; la orden de trabajo ya no los trae
    const montoTipo = (_tipo: number) => 0;

    const porAuditar = fila.categoria === CategoriaConciliacion.POR_AUDITAR;
    const imagenes = orden?.archivos ?? [];

    const cambiarApelacion = async () => {
        setGuardandoApelacion(true);
        try { await onApelacion(fila.ordenId, !fila.marcadaApelacion); }
        finally { setGuardandoApelacion(false); }
    };

    return (
        <aside className="fixed bottom-0 right-0 top-0 z-40 flex w-full max-w-[380px] flex-col border-l border-line bg-surface shadow-menu">
            <header className="flex items-center justify-between border-b border-line px-6 py-4">
                <h2 className="text-base font-semibold text-ink">Detalle de SOT</h2>
                <button type="button" onClick={onClose} className="rounded-pill p-1.5 text-muted transition-colors hover:bg-page hover:text-ink" title="Cerrar (Esc)">
                    <X size={18} />
                </button>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
                {/* Identificación */}
                <div>
                    <div className="flex items-center gap-3">
                        <p className="text-xl font-bold text-ink">SOT {fila.sot}</p>
                        <CategoriaBadge categoria={fila.categoria} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-label">
                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-muted" /> {formatoFechaCorta(fila.fecha)}</span>
                        <span className="flex items-center gap-1.5 truncate" title={fila.tecnico}><User size={14} className="shrink-0 text-muted" /> {fila.tecnico || "-"}</span>
                        <span className="col-span-2 flex items-center gap-1.5 truncate" title={fila.tipoServicio}><Wrench size={14} className="shrink-0 text-muted" /> {fila.tipoServicio || "-"}</span>
                        <span className="flex items-center gap-1.5">
                            {fila.cantidadImagenes > 0
                                ? <><ImageIcon size={14} className="text-primary" /> Con evidencia</>
                                : <><ImageOff size={14} className="text-muted" /> Sin evidencia</>}
                        </span>
                    </div>
                </div>

                {/* Valorización almacén */}
                <section>
                    <h3 className="mb-2 text-sm font-semibold text-ink">Valorización almacén</h3>
                    <div className="rounded-mid border border-line p-1">
                        {LINEAS_VALORIZACION.map((l) => {
                            const monto = montoTipo(l.tipo);
                            return <Fila key={l.tipo} etiqueta={l.label}>{!orden ? "…" : monto > 0 ? formatoSoles(monto) : "-"}</Fila>;
                        })}
                        <div className="mx-3 my-1 border-t border-line" />
                        <Fila etiqueta="P. Total" destacada>{formatoSoles(fila.valorizado)}</Fila>
                    </div>
                </section>

                {/* Pago (según auditoría) */}
                <section>
                    <h3 className="mb-2 text-sm font-semibold text-ink">Pago Claro</h3>
                    <div className="rounded-mid border border-line p-1">
                        <Fila etiqueta="Monto a pagar">{fila.pagado === null ? "—" : formatoSoles(fila.pagado)}</Fila>
                        <Fila etiqueta="Estado de pago">
                            <EstadoPagoChip estado={fila.estadoPago} motivo={fila.motivoNoPago} />
                        </Fila>
                        {fila.motivoNoPago && <Fila etiqueta="Motivo no pago">{fila.motivoNoPago}</Fila>}
                        <Fila etiqueta="Diferencia">
                            <span className={fila.diferencia && fila.diferencia < 0 ? "font-semibold text-danger" : ""}>{formatoDiferencia(fila.diferencia)}</span>
                        </Fila>
                        <div className="px-3 py-2 text-sm">
                            <p className="text-label">Motivo</p>
                            <p className="mt-0.5 text-ink">{fila.motivo || (porAuditar ? "Pendiente de auditoría" : "Sin observaciones")}</p>
                        </div>
                    </div>
                </section>

                {/* Evidencia */}
                <section>
                    <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-ink">Evidencia</h3>
                        {imagenes.length > 0 && <span className="text-xs text-muted">{imagenes.length} {imagenes.length === 1 ? "evidencia" : "evidencias"}</span>}
                    </div>
                    {!orden ? (
                        <div className="h-20 animate-pulse rounded-mid bg-page" />
                    ) : imagenes.length === 0 ? (
                        <p className="flex items-center gap-2 rounded-mid border border-dashed border-warning/30 bg-warning-soft/50 px-3 py-3 text-xs text-warning">
                            <ImageOff size={16} /> Falta imagen del técnico para validar
                        </p>
                    ) : (
                        <div className="flex items-center gap-2">
                            {imagenes.slice(0, 3).map((img) => (
                                <img
                                    key={img.archivoId}
                                    src={urlArchivo(img)}
                                    alt={img.nombreArchivo}
                                    className="h-20 w-20 rounded-mid border border-line object-cover"
                                />
                            ))}
                            <button
                                type="button"
                                onClick={() => navigate(`/ordenes/${fila.sot}/editar`)}
                                className="flex h-20 flex-1 flex-col items-center justify-center rounded-mid text-xs font-medium text-primary transition-colors hover:bg-primary-soft"
                            >
                                <ChevronRight size={18} /> Ver todas
                            </button>
                        </div>
                    )}
                </section>

                {/* Apelación */}
                <section className="rounded-mid border border-warning/30 bg-warning-soft/40 p-4">
                    <div className="flex items-start gap-3">
                        <Megaphone size={18} className="mt-0.5 shrink-0 text-warning" />
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-ink">Marcar para apelación</p>
                                {fila.marcadaApelacion && (
                                    <span className="inline-flex items-center gap-1 rounded-pill bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning">
                                        <CheckCircle2 size={11} /> Marcada
                                    </span>
                                )}
                            </div>
                            <p className="mt-0.5 text-xs text-label">Indica si deseas incluir esta SOT en la apelación a Claro.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={cambiarApelacion}
                        disabled={guardandoApelacion}
                        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-pill border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                            fila.marcadaApelacion
                                ? "border-line bg-surface text-label hover:bg-page"
                                : "border-primary/40 bg-surface text-primary hover:bg-primary-soft"
                        }`}
                    >
                        <Megaphone size={15} />
                        {guardandoApelacion ? "Guardando..." : fila.marcadaApelacion ? "Quitar de apelación" : "Marcar como apelación"}
                    </button>
                </section>
            </div>

            <footer className="border-t border-line px-6 py-4">
                <button
                    type="button"
                    onClick={() => navigate(`/ordenes/${fila.sot}/editar`)}
                    className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-pill bg-brand px-5 text-sm font-semibold text-on-primary transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ClipboardCheck size={16} /> Ver orden de trabajo
                </button>
            </footer>
        </aside>
    );
};
