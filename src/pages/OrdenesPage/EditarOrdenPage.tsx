// src/pages/OrdenesPage/EditarOrdenPage.tsx
import { useEffect, useMemo, useState } from "react";
import { OrdenInfoCard } from "../../components/Ordenes/OrdenInfoCard";
import { OrdenResumenCard } from "../../components/Ordenes/OrdenResumenCard";
import { OrdenServiciosCard } from "../../components/Ordenes/OrdenServiciosCard";
import type { OrdenTrabajoDetalleResponse,OrdenDetalleTrabajo,EditarOrdenCompletaRequest,EstadoOrden  } from "../../types/Ordenes"; 
import { useOrdenTrabajo } from "../../hooks/ordenes/useOrden";
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowBigLeftIcon } from 'lucide-react';
import { ContenedorImagenes } from "../../components/Ordenes/ContenedorImagenes";
import { CategoriaType } from "../../types/enums/Categoria";

export const EditarOrdenPage = () => {
  const navigate  = useNavigate();
  const { id } = useParams<{ id: string }>();
  const idOrden = Number(id);
  const {TraerPorId,EditarOrdenCompleta} = useOrdenTrabajo();
  //const { EditarOrden,TraerPorId,isLoading} = useOrdenTrabajo();
  const [orden, setOrden] = useState<OrdenTrabajoDetalleResponse | null>(null);
  // servicios de la orden: viven aquí porque los usan la tabla, el resumen y el guardado
  const [detalles, setDetalles] = useState<OrdenDetalleTrabajo[]>([]);
  const [detallesEliminados,setDetallesEliminados] = useState<number[]>([]);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  // estado y observación tal como llegaron del back, para saber si la orden se editó
  const [original, setOriginal] = useState<{ estado: number; descripcion: string } | null>(null);
  const [estadoManual, setEstadoManual] = useState(false);

  // Estado automático: una orden INGRESADA que se edita pasa a PROCESADO (el back aplica la misma regla).
  // Si el usuario elige un estado a mano, se respeta.
  const estado = useMemo(() => {
    if (!orden || !original) return orden?.estado ?? CategoriaType.INGRESADO;
    if (estadoManual) return orden.estado;
    const editada = orden.descripcion !== original.descripcion
      || detallesEliminados.length > 0
      || detalles.some((d) => d.detalleId == null);
    return editada && original.estado === CategoriaType.INGRESADO ? CategoriaType.PROCESADO : original.estado;
  }, [orden, original, estadoManual, detalles, detallesEliminados]);

  const guardar = async () => {
      if (!orden) return;

    const request: EditarOrdenCompletaRequest = {
      Sot: orden.sot,
      Descripcion: orden.descripcion,
      Estado: estado,
      DetallesNuevos: detalles.filter((d) => d.detalleId == null),
      DetallesEditados: detalles.filter((d) => d.detalleId != null),
      DetallesEliminados: detallesEliminados,
      ArchivosEliminados: [],
    };
    try {
      setErrorGuardar(null);
      await EditarOrdenCompleta(idOrden,request);
      navigate('/ordenes');
    } catch (err: any) {
      // si falla nos quedamos en la página y mostramos el motivo
      setErrorGuardar(err.response?.data?.error ?? err.response?.data?.title ?? "No se pudo guardar la orden");
    }
  };

  useEffect(
    () => {
        const cargar = async () => {
        const data = await TraerPorId(idOrden);
        if (!data) return;
        setOrden(data);
        setOriginal({ estado: data.estado, descripcion: data.descripcion });
        setDetalles(data.detalles ?? []);
  };
  cargar();
    }, [idOrden]
  )
  //manipularemos los datos
  const agregarDetalle = (detalle: OrdenDetalleTrabajo) =>{
    setDetalles((prev) => [...prev, detalle]);
  }

  const eliminarDetalle = (index: number) => {
    const detalleId = detalles[index]?.detalleId; 
    if (detalleId != null)setDetallesEliminados((prev) => [...prev,detalleId]);      
        setDetalles((prev) => prev.filter((_, i) => i !== index))
    };

  const cambiarCampo = (campo: "estado" | "descripcion", valor: string | number) => {
    if (campo === "estado") setEstadoManual(true);
    setOrden((prev) => (prev ? { ...prev, [campo]: valor } : prev));
  };



  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Editar Orden de Trabajo</h1>
            <p className="mt-1 text-sm text-slate-500">
              Actualiza la información de la orden y los servicios realizados.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Botón Regresar (Secundario) */}
            <button
              type="button"
              onClick={() => navigate("/Ordenes")}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ArrowBigLeftIcon size={16} />
              Regresar
            </button>

            {/* Botón Guardar (Principal) */}
            <button
              type="button"
              onClick={guardar}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Save size={16} />
              Guardar cambios
            </button>
          </div>

        </div>
        {errorGuardar && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {errorGuardar}
          </p>
        )}
      </div>

    <div className="gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="grid grid-cols-[1fr_280px] gap-6">
          <OrdenInfoCard
            sot={orden?.sot || 0}
            estado={estado}
            descripcion={orden?.descripcion || ""}
            onChange={cambiarCampo}
          />
          <OrdenResumenCard 
            estado={estado}
            cantidad={detalles.length}
            total={detalles.reduce((acumulador,prev) => acumulador+(prev?.precioTotal || 0 ),0)} 
          />
        </div>

        <OrdenServiciosCard 
          detalles={detalles}
          onAgregar={agregarDetalle}
          onEliminar={eliminarDetalle}
        
        />          
      </div>

      <div className="space-y-6 py-7">
        {/* <OrdenImagenesCard imagenes={form.imagenes} ... /> */}
        <ContenedorImagenes
          imagenes={orden?.imagenes ?? []}
        />
      </div>
    </div>
    </div>
  );
}