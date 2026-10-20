import type { OrdenTrabajoList, OrdenTrabajoDetalleResponse } from '../../types/Ordenes';
import { Trash2, Eye, Edit2, ImageIcon, AudioWaveform, Image, EyeDashed, Inbox, CheckCircle2, ImageOff, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
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
import { CeldaEditable } from '../shared/CeldaEditable';
import { claseTabla, claseTh, claseTd, claseCheckbox, claseFinFijas, FilasRelleno, CeldaChevron } from '../ui/DataTable';
import { ESTADOS_ORDEN } from '../shared/EstadoBadge';
import { edicionRapida } from '../../services/Ordenes/OrdenesTrabajo.service';
import type { EdicionRapidaRequest, EstadoOrden } from '../../types/Ordenes';
import type { TecnicoOpcion } from '../../types/dashboard.types';

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
  // edición en la tabla (solo admin y almacén)
  tecnicos?: TecnicoOpcion[];
  onFilaEditada?: () => void;   // p. ej. refrescar las tarjetas; la fila ya se actualiza sola
}

// columnas de montos editables: campo de la fila + tipo de detalle en el back
const MONTOS: { campo: 'costo' | 'adicional' | 'drop150' | 'drop200' | 'drop300'; titulo: string; tipo: number }[] = [
    { campo: 'costo', titulo: 'Costo', tipo: 0 },
    { campo: 'adicional', titulo: 'Adicional', tipo: 1 },
    { campo: 'drop150', titulo: 'Drop 150', tipo: 2 },
    { campo: 'drop200', titulo: 'Drop 200', tipo: 3 },
    { campo: 'drop300', titulo: 'Drop 300', tipo: 4 },
];

export const OrdenesTable = ({ ordenes , isLoading , onDelete, seleccion, onSeleccionar, onSeleccionarTodas, onActualizado, tecnicos = [], onFilaEditada}:Propiedades) =>{
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

    // filas que se editaron en la tabla: se muestran con lo que devolvió el back, sin recargar todo el listado
    const [editadas, setEditadas] = useState<Record<number, OrdenTrabajoList>>({});
    useEffect(() => { setEditadas({}); }, [ordenes]);
    const filas = ordenes.map((o) => editadas[o.ordenId] ?? o);

    const guardar = async (ordenId: number, cambio: EdicionRapidaRequest) => {
        const fila = await edicionRapida(ordenId, cambio);   // si falla, CeldaEditable muestra el error
        setEditadas((prev) => ({ ...prev, [ordenId]: fila }));
        onFilaEditada?.();
    };

    const opcionesEstado = Object.entries(ESTADOS_ORDEN).map(([valor, info]) => ({ valor, etiqueta: info.label }));
    const opcionesTecnico = (orden: OrdenTrabajoList) => {
        const lista = tecnicos.map((t) => ({ valor: String(t.usuarioId), etiqueta: t.nombre }));
        // si el técnico actual no está en la lista (p. ej. otro rol), igual se muestra
        if (orden.usuarioId && !tecnicos.some((t) => t.usuarioId === orden.usuarioId))
            lista.unshift({ valor: String(orden.usuarioId), etiqueta: orden.nombreUsuario || `Usuario ${orden.usuarioId}` });
        return lista;
    };

    const handleDelete = async (orden: OrdenTrabajoList) => {
        if (!window.confirm(`¿Eliminar la SOT ${orden.sot}? Esta acción no se puede deshacer.`)) return;
        await onDelete(orden.ordenId);
    };

    // el técnico no ve montos ni la columna técnico (siempre es él)
    const conSeleccion = !esTecnico && !!seleccion && !!onSeleccionar;
    // + Ref. img para todos; + Pago solo para admin y almacén
    const columnas = (esTecnico ? 6 : 15) + (conSeleccion ? 1 : 0);
    const puedeEditar = !esTecnico;
    // columnas fijas al desplazar: casilla + SOT a la izquierda, acciones a la derecha
    const fijaCasilla = "sticky left-0 z-10 w-10 min-w-10 bg-inherit";
    const fijaSot = `sticky ${conSeleccion ? "left-10" : "left-0"} z-10 bg-inherit ${claseFinFijas}`;
    const fijaAcciones = "sticky right-0 z-10 bg-inherit border-l border-l-line-fixed";
    // en el encabezado las fijas van por encima de todo (fijas a la izquierda y arriba a la vez)
    const thFija = "z-30";
    // solo se pueden seleccionar las que aún no están auditadas
    const seleccionables = filas.filter((o) => !o.auditada).map((o) => o.ordenId);
    const todasMarcadas = seleccionables.length > 0 && seleccionables.every((id) => seleccion?.has(id));

    return (
        <div>
            <table className={claseTabla}>
                <thead>
                <tr className="bg-surface">
                    {conSeleccion && (
                        <th className={`${claseTh} ${fijaCasilla} ${thFija}`}>
                            <input
                                type="checkbox"
                                checked={todasMarcadas}
                                disabled={seleccionables.length === 0}
                                onChange={() => onSeleccionarTodas?.(todasMarcadas ? [] : seleccionables)}
                                className={claseCheckbox}
                                aria-label="Seleccionar las SOT sin auditar de esta página"
                            />
                        </th>
                    )}
                    <th className={`${claseTh} ${fijaSot} ${thFija}`}>SOT</th>
                    <th className={claseTh}>Fecha</th>
                    {!esTecnico && <th className={`${claseTh} min-w-48`}>Técnico</th>}
                    <th className={`${claseTh} min-w-36`}>Estado</th>
                    {!esTecnico && MONTOS.map((m) => <th key={m.campo} className={`${claseTh} min-w-28`}>{m.titulo}</th>)}
                    {!esTecnico && <th className={claseTh}>Total</th>}
                    {!esTecnico && <th className={claseTh}>Pago</th>}
                    <th className={claseTh}>Ref. img</th>
                    <th className={`${claseTh} min-w-64`}>Observaciones</th>
                    <th className={`${claseTh} ${fijaAcciones} ${thFija}`} aria-label="Acciones" />
                </tr>
                </thead>
                <tbody>
                {isLoading ? (
                    // filas "fantasma" mientras carga, para que la tabla no salte
                    Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className="bg-surface">
                            <td colSpan={columnas} className={claseTd}>
                                <div className="h-3.5 w-full animate-pulse rounded-control bg-line-soft" />
                            </td>
                        </tr>
                    ))
                ) : filas.length === 0 ? (
                    <tr className="bg-surface">
                        <td colSpan={columnas} className={`${claseTd} h-auto py-12`}>
                            <Inbox size={32} className="mx-auto text-line" />
                            <p className="mt-2 text-sm font-medium text-label">No hay órdenes para mostrar</p>
                            <p className="text-xs text-muted">Prueba cambiando los filtros o importa un Excel.</p>
                        </td>
                    </tr>
                ) : (
                    <>
                    {filas.map(( orden ) => (
                    // fondo opaco en la fila: las columnas fijas lo heredan (bg-inherit) y tapan lo que se desplaza debajo
                    <tr key={orden.ordenId} className={`transition-colors ${seleccion?.has(orden.ordenId) ? 'bg-selected' : 'bg-surface hover:bg-hover'}`}>
                        {conSeleccion && (
                            <td className={`${claseTd} ${fijaCasilla}`}>
                                <input
                                    type="checkbox"
                                    checked={seleccion!.has(orden.ordenId)}
                                    disabled={orden.auditada}
                                    onChange={() => onSeleccionar!(orden.ordenId)}
                                    title={orden.auditada ? 'Ya está auditada' : 'Seleccionar para auditar'}
                                    className={claseCheckbox}
                                />
                            </td>
                        )}
                        <td className={`${claseTd} ${fijaSot}`}>
                            <span className="inline-flex items-center gap-1.5 font-semibold">
                                <FileText size={14} className="text-label" /> {orden.sot}
                            </span>
                        </td>
                        <td className={claseTd}>{formatoFecha(orden.fecha)}</td>
                        {!esTecnico && (
                            <td className={`${claseTd} px-1 text-left`}>
                                <CeldaEditable
                                    tipo="select"
                                    valor={String(orden.usuarioId ?? '')}
                                    opciones={opcionesTecnico(orden)}
                                    mostrar={orden.nombreUsuario || "-"}
                                    onGuardar={(v) => guardar(orden.ordenId, { usuarioId: Number(v) })}
                                />
                            </td>
                        )}
                        <td className={`${claseTd} px-1`}>
                            <div className="flex items-center justify-center gap-1.5">
                                <CeldaEditable
                                    tipo="select"
                                    valor={String(orden.estado)}
                                    opciones={opcionesEstado}
                                    mostrar={<EstadoBadge estado={orden.estado} />}
                                    deshabilitada={!puedeEditar}
                                    onGuardar={(v) => guardar(orden.ordenId, { estado: Number(v) as EstadoOrden })}
                                />
                                {orden.auditada && (
                                    <span title="SOT auditada" className="text-success"><CheckCircle2 size={16} /></span>
                                )}
                            </div>
                        </td>
                        {!esTecnico && MONTOS.map((m) => {
                            const monto = orden[m.campo] ?? 0;
                            return (
                                <td key={m.campo} className={`${claseTd} px-1 tabular-nums`}>
                                    <CeldaEditable
                                        tipo="monto"
                                        alinear="derecha"
                                        valor={monto.toFixed(2)}
                                        mostrar={monto === 0 ? <span className="text-line">—</span> : formatoSoles(monto)}
                                        onGuardar={(v) => guardar(orden.ordenId, { tipoMonto: m.tipo, monto: Number(v) })}
                                    />
                                </td>
                            );
                        })}
                        {!esTecnico && (
                            <td className={`${claseTd} text-right font-semibold tabular-nums`}>
                                {/* si la auditoría descontó algo, se muestra el monto real a pagar */}
                                {orden.auditada && orden.montoAPagar !== (orden.precioTotal ?? 0) ? (
                                    <>
                                        <span className={orden.montoAPagar === 0 ? "text-danger" : "text-ink"}>{formatoSoles(orden.montoAPagar)}</span>
                                        <span className="ml-1.5 text-xs font-normal text-muted line-through">{formatoSoles(orden.precioTotal)}</span>
                                    </>
                                ) : formatoSoles(orden.precioTotal)}
                            </td>
                        )}
                        {!esTecnico && (
                            <td className={claseTd}>
                                <SelectorEstadoPago
                                    ordenId={orden.ordenId}
                                    sot={orden.sot}
                                    estadoPago={orden.estadoPago}
                                    motivoNoPago={orden.motivoNoPago}
                                    onGuardado={() => onActualizado?.()}
                                />
                            </td>
                        )}
                        <td className={claseTd}>
                            {/* se cuenta en la consulta del back: siempre al día aunque el técnico suba fotos después */}
                            {(orden.cantidadImagenes ?? 0) > 0 ? (
                                <button
                                    type="button"
                                    onClick={() => abrir(orden.ordenId, "imagenes")}
                                    className="inline-flex items-center gap-1.5 rounded-control px-2 py-1 text-xs font-medium text-info transition-colors hover:bg-info-soft"
                                    title="Ver las fotos de esta SOT"
                                >
                                    <ImageIcon size={14} /> {orden.cantidadImagenes} {orden.cantidadImagenes === 1 ? "foto" : "fotos"}
                                </button>
                            ) : (
                                <span className="inline-flex items-center gap-1 rounded-badge bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">
                                    <ImageOff size={12} /> Sin fotos
                                </span>
                            )}
                        </td>
                        <td className={`${claseTd} max-w-xs px-1 text-left text-label`}>
                            <CeldaEditable
                                tipo="texto"
                                valor={orden.descripcion ?? ""}
                                mostrar={orden.descripcion || <span className="italic text-placeholder">Agregar observación</span>}
                                deshabilitada={!puedeEditar}
                                onGuardar={(v) => guardar(orden.ordenId, { descripcion: v })}
                            />
                        </td>
                        <td className={`${claseTd} ${fijaAcciones} px-1`}>
                            <div className="flex items-center justify-center gap-0.5">
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
                                <CeldaChevron titulo="Abrir la orden" onClick={() => navigate(`/ordenes/${orden.ordenId}/editarCompleto`)} />
                            </div>
                        </td>
                    </tr>
                    ))}
                    {/* filas vacías para mantener el aspecto de hoja */}
                    <FilasRelleno actuales={filas.length} columnas={columnas} />
                    </>
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
