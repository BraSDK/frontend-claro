import type { OrdenTrabajoList, OrdenTrabajoDetalleResponse } from '../../types/Ordenes';
import { Trash2, Edit, Eye, Edit2, ImageIcon, AudioWaveform, Image, EyeDashed, Inbox, CheckCircle2, ImageOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { useAuth } from '../../hooks/useAuth';
import { MenuDinamico } from "../../components/shared/MenuDinamico";
import { ModalData } from '../shared/ModalData';
import { GridPresentation } from "../../components/shared/GridPresentacion";
import { TablaDetalles } from './TablaDetalles';
import { PictureVisor } from "../../components/shared/PictureVisor";
import { EstadoBadge } from '../shared/EstadoBadge';
import { getOrdenById } from '../../services/Ordenes/OrdenesTrabajo.service';
import { formatoFecha, formatoSoles } from '../../utils/formato';
import { SelectorEstadoPago } from './SelectorEstadoPago';

interface Propiedades {
  ordenes: OrdenTrabajoList[];
  isLoading: boolean;
  onDelete: (ordenId:number) => void | Promise<void>;
  // selección para la auditoría masiva (opcional: sin estas props no se muestran casillas)
  seleccion?: Set<number>;
  onSeleccionar?: (ordenId: number) => void;
  onSeleccionarTodas?: (ordenIds: number[]) => void;
  // se llama después de auditar el pago de una SOT, para refrescar la lista y los totales
  onActualizado?: () => void;
}

export const OrdenesTable = ({ ordenes , isLoading , onDelete, seleccion, onSeleccionar, onSeleccionarTodas, onActualizado}:Propiedades) =>{
    const [tipo,setTipo] = useState("");
    const [ordenVista, setOrdenVista] = useState<OrdenTrabajoDetalleResponse | null>(null);
    const { esTecnico} = useAuth();
    const navigate = useNavigate();

    // se pide al service directo: el hook useOrdenTrabajo dispararía otra carga del listado
    const abrir = async (ordenId: number, vista: "observar" | "imagenes") => {
        const data = await getOrdenById(ordenId);
        setTipo(vista);
        setOrdenVista(data);
    };

    const handleDelete = async (orden: OrdenTrabajoList) => {
        if (!window.confirm(`¿Eliminar la SOT ${orden.sot}? Esta acción no se puede deshacer.`)) return;
        await onDelete(orden.ordenId);
    };

    // el técnico no ve montos ni la columna técnico (siempre es él)
    const conSeleccion = !esTecnico && !!seleccion && !!onSeleccionar;
    // + Ref. img para todos; + Pago solo para admin y almacén
    const columnas = (esTecnico ? 6 : 9) + (conSeleccion ? 1 : 0);
    // solo se pueden seleccionar las que aún no están auditadas
    const seleccionables = ordenes.filter((o) => !o.auditada).map((o) => o.ordenId);
    const todasMarcadas = seleccionables.length > 0 && seleccionables.every((id) => seleccion?.has(id));

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                    {conSeleccion && (
                        <th className="w-10 pl-6 py-3.5">
                            <input
                                type="checkbox"
                                checked={todasMarcadas}
                                disabled={seleccionables.length === 0}
                                onChange={() => onSeleccionarTodas?.(todasMarcadas ? [] : seleccionables)}
                                className="h-4 w-4 accent-red-600"
                                aria-label="Seleccionar las SOT sin auditar de esta página"
                            />
                        </th>
                    )}
                    <th className="px-6 py-3.5">SOT</th>
                    <th className="px-6 py-3.5">Fecha</th>
                    {!esTecnico && <th className="px-6 py-3.5">Técnico</th>}
                    <th className="px-6 py-3.5">Estado</th>
                    {!esTecnico && <th className="px-6 py-3.5 text-right">Monto</th>}
                    {!esTecnico && <th className="px-6 py-3.5">Pago</th>}
                    <th className="px-6 py-3.5">Ref. img</th>
                    <th className="px-6 py-3.5">Observaciones</th>
                    <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                    // filas "fantasma" mientras carga, para que la tabla no salte
                    Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i}>
                            <td colSpan={columnas} className="px-6 py-4">
                                <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                            </td>
                        </tr>
                    ))
                ) : ordenes.length === 0 ? (
                    <tr>
                        <td colSpan={columnas} className="px-6 py-14 text-center">
                            <Inbox size={32} className="mx-auto text-gray-300" />
                            <p className="mt-2 text-sm font-medium text-gray-600">No hay órdenes para mostrar</p>
                            <p className="text-xs text-gray-400">Prueba cambiando los filtros o importa un Excel.</p>
                        </td>
                    </tr>
                ) : (
                    ordenes.map(( orden ) => (
                    <tr key={orden.ordenId} className={`transition-colors ${seleccion?.has(orden.ordenId) ? 'bg-red-50/40' : 'hover:bg-gray-50/80'}`}>
                        {conSeleccion && (
                            <td className="pl-6 py-4">
                                <input
                                    type="checkbox"
                                    checked={seleccion!.has(orden.ordenId)}
                                    disabled={orden.auditada}
                                    onChange={() => onSeleccionar!(orden.ordenId)}
                                    title={orden.auditada ? 'Ya está auditada' : 'Seleccionar para auditar'}
                                    className="h-4 w-4 accent-red-600 disabled:opacity-30"
                                />
                            </td>
                        )}
                        <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">{orden.sot}</p>
                            <p className="text-xs text-gray-400">#{orden.ordenId}</p>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-gray-600">{formatoFecha(orden.fecha)}</td>
                        {!esTecnico && (
                            <td className="px-6 py-4 font-medium text-gray-700">{orden.nombreUsuario || "-"}</td>
                        )}
                        <td className="px-6 py-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <EstadoBadge estado={orden.estado} />
                                {orden.auditada && (
                                    <span title="SOT auditada" className="text-green-600"><CheckCircle2 size={16} /></span>
                                )}
                            </div>
                        </td>
                        {!esTecnico && (
                            <td className="whitespace-nowrap px-6 py-4 text-right font-semibold text-gray-900">
                                {/* si la auditoría descontó algo, se muestra el monto real a pagar */}
                                {orden.auditada && orden.montoAPagar !== (orden.precioTotal ?? 0) ? (
                                    <>
                                        <span className={orden.montoAPagar === 0 ? "text-red-600" : "text-gray-900"}>{formatoSoles(orden.montoAPagar)}</span>
                                        <span className="block text-xs font-normal text-gray-400 line-through">{formatoSoles(orden.precioTotal)}</span>
                                    </>
                                ) : formatoSoles(orden.precioTotal)}
                            </td>
                        )}
                        {!esTecnico && (
                            <td className="px-6 py-4">
                                <SelectorEstadoPago
                                    ordenId={orden.ordenId}
                                    sot={orden.sot}
                                    estadoPago={orden.estadoPago}
                                    motivoNoPago={orden.motivoNoPago}
                                    onGuardado={() => onActualizado?.()}
                                />
                            </td>
                        )}
                        <td className="whitespace-nowrap px-6 py-4">
                            {/* se cuenta en la consulta del back: siempre al día aunque el técnico suba fotos después */}
                            {(orden.cantidadImagenes ?? 0) > 0 ? (
                                <button
                                    type="button"
                                    onClick={() => abrir(orden.ordenId, "imagenes")}
                                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                                    title="Ver las fotos de esta SOT"
                                >
                                    <ImageIcon size={14} /> {orden.cantidadImagenes} {orden.cantidadImagenes === 1 ? "foto" : "fotos"}
                                </button>
                            ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/15">
                                    <ImageOff size={12} /> Sin fotos
                                </span>
                            )}
                        </td>
                        <td className="max-w-xs truncate px-6 py-4 text-gray-500" title={orden.descripcion}>
                            {orden.descripcion || "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/ordenes/${orden.ordenId}/editarCompleto`)}
                                    title="Editar orden"
                                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                >
                                    <Edit size={18} />
                                </button>
                                {/* el menú maneja solo su botón, su estado y su posición */}
                                <MenuDinamico
                                    opciones={[
                                        { label: "Ver detalle", icono: <Eye size={16} />, accion: () => abrir(orden.ordenId, "observar") },
                                        { label: "Editar detalles", icono: <Edit2 size={16} />, accion: () => navigate(`/ordenes/${orden.ordenId}/detalles`) },
                                        { label: "Ver imágenes", icono: <ImageIcon size={16} />, accion: () => abrir(orden.ordenId, "imagenes") },
                                        ...(esTecnico ? [] : [{ label: "Auditar SOT", icono: <AudioWaveform size={16} />, accion: () => navigate(`/ordenes/${orden.ordenId}/auditar`) }]),
                                        { label: "Eliminar", icono: <Trash2 size={16} />, accion: () => handleDelete(orden), opcionAdviser: true },
                                    ]}
                                />
                            </div>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            {ordenVista !== null && (
                <ModalData
                    isOpen={true}
                    onClose={()=> setOrdenVista(null)}
                    tittle={
                        tipo === "imagenes" ? "Imagenes subidas " : tipo === "observar" ? "Sericios de la OT" : "Nada"
                    }
                    icon={
                        tipo === "imagenes" ? (<Image size={20}/>) : (<EyeDashed size={20}/>)
                    }
                    subtitle={`Sot ${ordenVista.sot}`}
                >
                {tipo === "observar" && (
                    <>
                        <GridPresentation
                            ordenDetalle={ordenVista}
                        />

                        <TablaDetalles
                            detalles={ordenVista.detalles || []}
                        />
                    </>
                )}
                {tipo === "imagenes" && (
                        <PictureVisor
                            imgs={ordenVista.imagenes}

                        />
                    )
                }
                </ModalData>
            )}
            </div>
        );
    };
