import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Calendar, User, Wrench, Image as ImageIcon, ImageOff, Megaphone, CheckCircle2, ClipboardCheck, ChevronRight } from "lucide-react";
import { getOrdenById } from "../../services/Ordenes/OrdenesTrabajo.service";
import type { OrdenTrabajoDetalleResponse } from "../../types/Ordenes";
import { CategoriaConciliacion, type FilaConciliacion } from "../../types/conciliacion.types";
import { CategoriaBadge } from "./CategoriaBadge";
import { EstadoPagoChip } from "../shared/EstadoPagoChip";
import { formatoDiferencia, formatoFechaCorta, formatoSoles } from "../../utils/formato";

const BASE_URL = import.meta.env.VITE_API_URL2;

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
    <div className={`flex items-center justify-between px-3 py-2 text-sm ${destacada ? "rounded-lg bg-blue-50 font-semibold text-blue-900" : "text-slate-600"}`}>
        <span>{etiqueta}</span>
        <span className={destacada ? "" : "font-medium text-slate-800"}>{children}</span>
    </div>
);

export const DetalleSotDrawer = ({ fila, onClose, onApelacion }: Props) => {
    const navigate = useNavigate();
    const [orden, setOrden] = useState<OrdenTrabajoDetalleResponse | null>(null);
    const [guardandoApelacion, setGuardandoApelacion] = useState(false);

    useEffect(() => {
        setOrden(null);
        getOrdenById(fila.ordenId).then(setOrden).catch(() => setOrden(null));
    }, [fila.ordenId]);

    // cerrar con Escape
    useEffect(() => {
        const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", tecla);
        return () => window.removeEventListener("keydown", tecla);
    }, [onClose]);

    const montoTipo = (tipo: number) =>
        orden?.detalles?.filter((d) => d.tipo == tipo).reduce((acc, d) => acc + (d.precioTotal ?? 0), 0) ?? 0;

    const porAuditar = fila.categoria === CategoriaConciliacion.POR_AUDITAR;
    const imagenes = orden?.imagenes ?? [];

    const cambiarApelacion = async () => {
        setGuardandoApelacion(true);
        try { await onApelacion(fila.ordenId, !fila.marcadaApelacion); }
        finally { setGuardandoApelacion(false); }
    };

    return (
        <aside className="fixed bottom-0 right-0 top-0 z-40 flex w-full max-w-[380px] flex-col border-l border-slate-200 bg-white shadow-[-8px_0_30px_rgba(15,23,42,0.08)]">
            <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="text-base font-semibold text-slate-900">Detalle de SOT</h2>
                <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" title="Cerrar (Esc)">
                    <X size={18} />
                </button>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
                {/* Identificación */}
                <div>
                    <div className="flex items-center gap-3">
                        <p className="text-xl font-bold text-slate-900">SOT {fila.sot}</p>
                        <CategoriaBadge categoria={fila.categoria} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {formatoFechaCorta(fila.fecha)}</span>
                        <span className="flex items-center gap-1.5 truncate" title={fila.tecnico}><User size={14} className="shrink-0 text-slate-400" /> {fila.tecnico || "-"}</span>
                        <span className="col-span-2 flex items-center gap-1.5 truncate" title={fila.tipoServicio}><Wrench size={14} className="shrink-0 text-slate-400" /> {fila.tipoServicio || "-"}</span>
                        <span className="flex items-center gap-1.5">
                            {fila.cantidadImagenes > 0
                                ? <><ImageIcon size={14} className="text-blue-500" /> Con evidencia</>
                                : <><ImageOff size={14} className="text-slate-400" /> Sin evidencia</>}
                        </span>
                    </div>
                </div>

                {/* Valorización almacén */}
                <section>
                    <h3 className="mb-2 text-sm font-semibold text-slate-800">Valorización almacén</h3>
                    <div className="rounded-xl border border-slate-200 p-1">
                        {LINEAS_VALORIZACION.map((l) => {
                            const monto = montoTipo(l.tipo);
                            return <Fila key={l.tipo} etiqueta={l.label}>{!orden ? "…" : monto > 0 ? formatoSoles(monto) : "-"}</Fila>;
                        })}
                        <div className="mx-3 my-1 border-t border-slate-100" />
                        <Fila etiqueta="P. Total" destacada>{formatoSoles(fila.valorizado)}</Fila>
                    </div>
                </section>

                {/* Pago (según auditoría) */}
                <section>
                    <h3 className="mb-2 text-sm font-semibold text-slate-800">Pago Claro</h3>
                    <div className="rounded-xl border border-slate-200 p-1">
                        <Fila etiqueta="Monto a pagar">{fila.pagado === null ? "—" : formatoSoles(fila.pagado)}</Fila>
                        <Fila etiqueta="Estado de pago">
                            <EstadoPagoChip estado={fila.estadoPago} motivo={fila.motivoNoPago} />
                        </Fila>
                        {fila.motivoNoPago && <Fila etiqueta="Motivo no pago">{fila.motivoNoPago}</Fila>}
                        <Fila etiqueta="Diferencia">
                            <span className={fila.diferencia && fila.diferencia < 0 ? "font-semibold text-rose-600" : ""}>{formatoDiferencia(fila.diferencia)}</span>
                        </Fila>
                        <div className="px-3 py-2 text-sm">
                            <p className="text-slate-600">Motivo</p>
                            <p className="mt-0.5 text-slate-800">{fila.motivo || (porAuditar ? "Pendiente de auditoría" : "Sin observaciones")}</p>
                        </div>
                    </div>
                </section>

                {/* Evidencia */}
                <section>
                    <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-800">Evidencia</h3>
                        {imagenes.length > 0 && <span className="text-xs text-slate-400">{imagenes.length} {imagenes.length === 1 ? "evidencia" : "evidencias"}</span>}
                    </div>
                    {!orden ? (
                        <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                    ) : imagenes.length === 0 ? (
                        <p className="flex items-center gap-2 rounded-xl border border-dashed border-amber-200 bg-amber-50/50 px-3 py-3 text-xs text-amber-700">
                            <ImageOff size={16} /> Falta imagen del técnico para validar
                        </p>
                    ) : (
                        <div className="flex items-center gap-2">
                            {imagenes.slice(0, 3).map((img) => (
                                <img
                                    key={img.archivoId}
                                    src={`${BASE_URL}${img.src}`}
                                    alt={img.nombreArchivo}
                                    className="h-20 w-20 rounded-xl border border-slate-200 object-cover"
                                />
                            ))}
                            <button
                                type="button"
                                onClick={() => navigate(`/ordenes/${fila.ordenId}/auditar`)}
                                className="flex h-20 flex-1 flex-col items-center justify-center rounded-xl text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                            >
                                <ChevronRight size={18} /> Ver todas
                            </button>
                        </div>
                    )}
                </section>

                {/* Apelación */}
                <section className="rounded-xl border border-orange-200 bg-orange-50/40 p-4">
                    <div className="flex items-start gap-3">
                        <Megaphone size={18} className="mt-0.5 shrink-0 text-orange-500" />
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-slate-800">Marcar para apelación</p>
                                {fila.marcadaApelacion && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
                                        <CheckCircle2 size={11} /> Marcada
                                    </span>
                                )}
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500">Indica si deseas incluir esta SOT en la apelación a Claro.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={cambiarApelacion}
                        disabled={guardandoApelacion}
                        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                            fila.marcadaApelacion
                                ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                : "border-blue-200 bg-white text-blue-600 hover:bg-blue-50"
                        }`}
                    >
                        <Megaphone size={15} />
                        {guardandoApelacion ? "Guardando..." : fila.marcadaApelacion ? "Quitar de apelación" : "Marcar como apelación"}
                    </button>
                </section>
            </div>

            <footer className="border-t border-slate-100 px-6 py-4">
                <button
                    type="button"
                    onClick={() => navigate(`/ordenes/${fila.ordenId}/auditar`)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                    <ClipboardCheck size={16} /> {porAuditar ? "Auditar SOT" : "Revisar auditoría"}
                </button>
            </footer>
        </aside>
    );
};
