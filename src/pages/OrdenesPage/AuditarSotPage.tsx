// src/pages/OrdenesPage/AuditarSotPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowBigLeftIcon, ClipboardCheck, ImageOff, Images, Wrench, AlertTriangle, CheckCircle2, Ban, Save } from "lucide-react";
import { Card } from "../../components/Cards/Card";
import { TablaDetalles } from "../../components/Ordenes/TablaDetalles";
import { PictureVisor } from "../../components/shared/PictureVisor";
import { EstadoBadge, ESTADOS_ORDEN } from "../../components/shared/EstadoBadge";
import { auditarOrden, getOrdenById } from "../../services/Ordenes/OrdenesTrabajo.service";
import type { EstadoOrden, OrdenTrabajoDetalleResponse } from "../../types/Ordenes";
import { formatoFecha, formatoSoles } from "../../utils/formato";
import { CategoriaType } from "../../types/enums/Categoria";

const MAX_OBSERVACION = 500;

export const AuditarSotPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const idOrden = Number(id);

  const [orden, setOrden] = useState<OrdenTrabajoDetalleResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // formulario de auditoría
  const [descuento, setDescuento] = useState("");
  const [sinPago, setSinPago] = useState(false);
  const [observacion, setObservacion] = useState("");
  const [estado, setEstado] = useState<EstadoOrden>(CategoriaType.LIQUIDADO);
  const [estadoManual, setEstadoManual] = useState(false);   // si no lo cambian, al auditar queda LIQUIDADO
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  // llena el formulario con lo que ya tenga la orden (si se audita de nuevo)
  const llenar = (data: OrdenTrabajoDetalleResponse) => {
    setOrden(data);
    setSinPago(!!data.sinPago);
    setDescuento(data.sinPago || !data.descuento ? "" : String(data.descuento));
    setObservacion(data.observacionAuditoria ?? "");
    // una SOT ya auditada muestra su estado; una nueva propone LIQUIDADO (lo mismo que hará el back)
    setEstado(data.auditada ? (data.estado as EstadoOrden) : CategoriaType.LIQUIDADO);
    setEstadoManual(false);
  };

  useEffect(() => {
    getOrdenById(idOrden)
      .then(llenar)
      .catch(() => setErrorCarga("No se pudo cargar la SOT"))
      .finally(() => setCargando(false));
  }, [idOrden]);

  const total = orden?.precioTotal ?? 0;
  const montoDescuento = sinPago ? total : Math.min(Number(descuento) || 0, total);
  const montoAPagar = Math.max(0, total - montoDescuento);
  const porcentaje = total > 0 ? (montoDescuento / total) * 100 : 0;
  const sinImagenes = !!orden && orden.imagenes.length === 0;
  const descuentoInvalido = !sinPago && Number(descuento) > total;
  const faltaObservacion = (sinPago || montoDescuento > 0) && observacion.trim() === "";

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orden || descuentoInvalido || faltaObservacion) return;
    try {
      setGuardando(true);
      setMensaje(null);
      const data = await auditarOrden(idOrden, {
        descuento: sinPago ? 0 : Number(descuento) || 0,
        sinPago,
        observacion: observacion.trim(),
        estado: estadoManual ? estado : undefined,
      });
      llenar(data);
      setMensaje({ tipo: "ok", texto: "Auditoría guardada correctamente." });
    } catch (err: any) {
      if (err.response?.status === 403) setMensaje({ tipo: "error", texto: "No tienes permisos para auditar SOTs." });
      else setMensaje({ tipo: "error", texto: err.response?.data?.error ?? "No se pudo guardar la auditoría." });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <p className="p-8 text-center text-sm text-slate-500">Cargando SOT...</p>;
  if (errorCarga || !orden) return <p className="m-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorCarga ?? "SOT no encontrada"}</p>;

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <ClipboardCheck size={26} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Auditar SOT {orden.sot}</h1>
              <EstadoBadge estado={orden.estado} />
              {orden.auditada && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                  <CheckCircle2 size={12} /> Auditada el {formatoFecha(orden.fechaAuditoria)}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {orden.nombreUsuario || "Sin técnico"} · {formatoFecha(orden.fecha)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/ordenes")}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
        >
          <ArrowBigLeftIcon size={16} /> Regresar
        </button>
      </div>

      {/* Aviso: sin evidencia no se puede validar */}
      {sinImagenes && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800">
          <AlertTriangle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Falta imagen del técnico para validar</p>
            <p className="text-sm text-amber-700">
              Esta SOT no tiene fotos de la instalación. Puedes esperar a que el técnico las suba o registrar el descuento / multa correspondiente.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        {/* Evidencia y servicios */}
        <div className="min-w-0 space-y-6">
          <Card
            title="Evidencia del técnico"
            subtitle={sinImagenes ? "Sin imágenes" : `${orden.imagenes.length} ${orden.imagenes.length === 1 ? "imagen" : "imágenes"}`}
            icon={<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Images size={20} /></div>}
          >
            {sinImagenes ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/40 text-center">
                <ImageOff size={36} className="text-amber-400" />
                <p className="text-sm font-medium text-amber-800">Falta imagen del técnico para validar</p>
                <p className="text-xs text-amber-600">Las fotos se suben desde "Editar orden".</p>
              </div>
            ) : (
              <PictureVisor imgs={orden.imagenes} />
            )}
          </Card>

          <Card
            title="Servicios realizados"
            subtitle={`${orden.detalles?.length ?? 0} servicios · ${formatoSoles(total)}`}
            icon={<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Wrench size={20} /></div>}
          >
            <TablaDetalles detalles={orden.detalles ?? []} />
          </Card>
        </div>

        {/* Panel de auditoría */}
        <form onSubmit={guardar} className="h-fit space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Auditoría</h2>
            <p className="text-sm text-slate-500">Registra el descuento o la multa y su motivo.</p>
          </div>

          {/* Multa */}
          <label className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${sinPago ? "border-red-300 bg-red-50" : "border-slate-200 hover:bg-slate-50"}`}>
            <input
              type="checkbox"
              checked={sinPago}
              onChange={(e) => setSinPago(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-red-600"
            />
            <div>
              <p className={`flex items-center gap-1.5 text-sm font-semibold ${sinPago ? "text-red-700" : "text-slate-700"}`}>
                <Ban size={15} /> Multa: no se paga esta SOT
              </p>
              <p className="text-xs text-slate-500">El monto a pagar queda en S/ 0.00.</p>
            </div>
          </label>

          {/* Descuento */}
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Descuento / penalización
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">S/</span>
              <input
                type="number"
                min={0}
                max={total}
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                value={sinPago ? total.toFixed(2) : descuento}
                disabled={sinPago}
                onChange={(e) => setDescuento(e.target.value)}
                className={`h-11 w-full rounded-lg border bg-white pl-10 pr-16 text-sm text-slate-700 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400 focus:ring-4 ${
                  descuentoInvalido ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500/10"
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">{porcentaje.toFixed(0)}%</span>
            </div>
            {descuentoInvalido && <span className="text-xs font-normal text-red-600">No puede ser mayor que el monto de la SOT ({formatoSoles(total)}).</span>}
          </label>

          {/* Observación */}
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Observación
            <textarea
              rows={4}
              maxLength={MAX_OBSERVACION}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ej.: falta foto del ONT instalado; se descuenta el adicional de decos."
              className={`resize-none rounded-lg border bg-white px-3.5 py-2.5 text-sm font-normal text-slate-700 outline-none transition-all focus:ring-4 ${
                faltaObservacion ? "border-amber-400 focus:ring-amber-500/10" : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500/10"
              }`}
            />
            <span className="flex justify-between text-xs font-normal">
              <span className="text-amber-600">{faltaObservacion ? "Indica el motivo del descuento o la multa." : ""}</span>
              <span className="text-slate-400">{observacion.length}/{MAX_OBSERVACION}</span>
            </span>
          </label>

          {/* Estado */}
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Estado de la SOT
            <select
              value={estado}
              onChange={(e) => { setEstado(Number(e.target.value) as EstadoOrden); setEstadoManual(true); }}
              className="h-11 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              {Object.entries(ESTADOS_ORDEN).map(([valor, info]) => (
                <option key={valor} value={valor}>{info.label}</option>
              ))}
            </select>
          </label>

          {/* Resumen del pago */}
          <dl className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <div className="flex justify-between text-slate-600"><dt>Monto de la SOT</dt><dd>{formatoSoles(total)}</dd></div>
            <div className="flex justify-between text-red-600"><dt>{sinPago ? "Multa" : "Descuento"}</dt><dd>− {formatoSoles(montoDescuento)}</dd></div>
            <div className="flex items-baseline justify-between border-t border-slate-200 pt-2">
              <dt className="font-medium text-slate-700">Claro paga</dt>
              <dd className={`text-2xl font-bold ${montoAPagar === 0 ? "text-red-600" : "text-green-600"}`}>{formatoSoles(montoAPagar)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={guardando || descuentoInvalido || faltaObservacion}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={16} /> {guardando ? "Guardando..." : orden.auditada ? "Actualizar auditoría" : "Guardar auditoría"}
          </button>

          {mensaje && (
            <p className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${mensaje.tipo === "ok" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
              {mensaje.tipo === "ok" && <CheckCircle2 size={16} />} {mensaje.texto}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
