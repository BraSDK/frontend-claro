// src/pages/OrdenesPage/EditarDetallesPage.tsx
import { useEffect, useId, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowBigLeftIcon, Plus, Save, Wrench } from "lucide-react";
import { Card } from "../../components/Cards/Card";
import { TablaDetalles } from "../../components/Ordenes/TablaDetalles";
import { FormDetalleServicio } from "../../components/Ordenes/FormDetalleServicio";
import { ModalSmall } from "../../components/shared/ModalSmall";
import { agregarDetalleOrden, editarDetallesOrden, getOrdenById } from "../../services/Ordenes/OrdenesTrabajo.service";
import type { OrdenDetalleTrabajo, OrdenTrabajoDetalleResponse } from "../../types/Ordenes";

export const EditarDetallesPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const idOrden = Number(id);
  const formId = useId();

  const [orden, setOrden] = useState<OrdenTrabajoDetalleResponse | null>(null);
  // los detalles viven aquí: la tabla los muestra y el guardado los envía
  const [detalles, setDetalles] = useState<OrdenDetalleTrabajo[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        const data = await getOrdenById(idOrden);
        setOrden(data);
        setDetalles(data.detalles ?? []);
      } catch {
        setError("No se pudo cargar la orden");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [idOrden]);

  const agregarDetalle = (detalle: OrdenDetalleTrabajo) => {
    setDetalles((prev) => [...prev, detalle]);
    setModalAbierto(false);
  };

  // solo se quita de la lista; se borra en el back al guardar
  const eliminarDetalle = (index: number) => {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  };

  const guardar = async () => {
    const existentes = detalles.filter((d) => d.detalleId != null);
    const nuevos = detalles.filter((d) => d.detalleId == null);

    try {
      setGuardando(true);
      setError(null);
      // 1° el PUT: edita los existentes y borra los que ya no están en la lista.
      //    Va primero porque si agregáramos antes, el PUT borraría los recién agregados.
      await editarDetallesOrden(idOrden, existentes);
      // 2° los nuevos, uno por uno
      for (const detalle of nuevos) {
        await agregarDetalleOrden(idOrden, detalle);
      }
      navigate("/ordenes");
    } catch (err: any) {
      if (err.response?.status === 403) setError("No tienes permisos para editar los detalles de esta orden");
      else setError(err.response?.data?.error ?? "No se pudieron guardar los detalles");
    } finally {
      setGuardando(false);
    }
  };

  const total = detalles.reduce((acc, d) => acc + (d.precioTotal ?? 0), 0);

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Encabezado */}
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Editar detalles {orden && <span className="text-slate-400">· SOT {orden.sot}</span>}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Agrega, quita o revisa los servicios realizados en esta orden.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/ordenes")}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ArrowBigLeftIcon size={16} />
              Regresar
            </button>
            <button
              type="button"
              onClick={guardar}
              disabled={guardando || cargando || !orden}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      {/* Tabla de detalles */}
      <Card
        title="Servicios realizados"
        subtitle={`${detalles.length} ${detalles.length === 1 ? "servicio" : "servicios"} en la orden`}
        icon={
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Wrench size={20} />
          </div>
        }
      >
        {cargando ? (
          <p className="p-4 text-center text-sm text-slate-500">Cargando detalles...</p>
        ) : (
          <TablaDetalles detalles={detalles} onDelete={eliminarDetalle} />
        )}

        {/* Botón + debajo de la tabla */}
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          disabled={cargando || !orden}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 py-3 text-sm font-medium text-slate-500 transition-colors hover:border-blue-400 hover:bg-blue-50/40 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={18} />
          Agregar servicio
        </button>

        {/* Total */}
        <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="text-sm font-medium text-slate-600">Total de la orden</span>
          <span className="text-lg font-semibold text-blue-600">S/ {total.toFixed(2)}</span>
        </div>
      </Card>

      {/* Modalcito para agregar un servicio */}
      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setModalAbierto(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
            <ModalSmall
              title="Agregar servicio"
              isOpen={modalAbierto}
              onClose={() => setModalAbierto(false)}
              formId={formId}
              submitLabel="Agregar"
            >
              <FormDetalleServicio formId={formId} onSubmit={agregarDetalle} />
            </ModalSmall>
          </div>
        </div>
      )}
    </div>
  );
};
