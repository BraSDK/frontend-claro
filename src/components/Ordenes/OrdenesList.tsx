import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, ImageIcon, Images, Inbox, Trash2, FileText } from 'lucide-react';
import { MenuDinamico } from '../shared/MenuDinamico';
import { CeldaEditable } from '../shared/CeldaEditable';
import { EstadoMapeado, MAPEO_ESTADOS } from '../ui/StatusBadge';
import { claseTabla, claseTh, claseTd, claseFinFijas, FilasRelleno, CeldaChevron } from '../ui/DataTable';
import { edicionRapida } from '../../services/Ordenes/OrdenesTrabajo.service';
import { usePermisosOrden } from '../../hooks/ordenes/useOrden';
import { MAX_TRABAJO_REALIZADO, type EdicionRapidaRequest, type EstadoClaro, type OrdenTrabajo } from '../../types/Ordenes';

interface Props {
    ordenes: OrdenTrabajo[];
    cargando: boolean;
    nombreTecnico: (doc: string) => string | null;
    onVerImagenes: (orden: OrdenTrabajo) => void;
    onEliminar: (orden: OrdenTrabajo) => void;
}

const COLUMNAS = 7;
const opcionesEstado = Object.entries(MAPEO_ESTADOS.campo).map(([valor, info]) => ({ valor, etiqueta: info.label }));

export const OrdenesTable = ({ ordenes, cargando, nombreTecnico, onVerImagenes, onEliminar }: Props) => {
    const navigate = useNavigate();
    const { puedeEditarCampos } = usePermisosOrden();

    // filas editadas en la tabla: se muestran con lo que devolvió el back, sin recargar todo el listado
    // (se guardan junto con la lista a la que pertenecen: si llega otra lista, se descartan)
    const [editadas, setEditadas] = useState<{ base: OrdenTrabajo[]; filas: Record<number, OrdenTrabajo> }>({ base: ordenes, filas: {} });
    const vigentes = editadas.base === ordenes ? editadas.filas : {};
    const filas = ordenes.map((o) => vigentes[o.ordenTrabajoId] ?? o);

    const guardar = async (ordenId: number, cambio: EdicionRapidaRequest) => {
        const fila = await edicionRapida(ordenId, cambio);   // si falla, CeldaEditable muestra el error
        setEditadas((prev) => ({ base: ordenes, filas: { ...(prev.base === ordenes ? prev.filas : {}), [ordenId]: fila } }));
    };

    const editar = (orden: OrdenTrabajo) => navigate(`/ordenes/${orden.sot}/editar`, { state: { orden } });

    // columnas fijas al desplazar: SOT a la izquierda, acciones a la derecha
    const fijaSot = `sticky left-0 z-10 bg-inherit ${claseFinFijas}`;
    const fijaAcciones = 'sticky right-0 z-10 bg-inherit border-l border-l-line-fixed';

    return (
        <table className={claseTabla}>
            <thead>
                <tr className="bg-page">
                    <th className={`${claseTh} ${fijaSot} z-30`}>SOT</th>
                    <th className={`${claseTh} min-w-52`}>Técnico</th>
                    <th className={claseTh}>Doc. técnico</th>
                    <th className={`${claseTh} min-w-72`}>Trabajo realizado</th>
                    <th className={`${claseTh} min-w-36`}>Estado en campo</th>
                    <th className={claseTh}>Imágenes</th>
                    <th className={`${claseTh} ${fijaAcciones} z-30`} aria-label="Acciones" />
                </tr>
            </thead>
            <tbody>
                {cargando ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className="bg-surface">
                            <td colSpan={COLUMNAS} className={claseTd}>
                                <div className="h-3.5 w-full animate-pulse rounded-control bg-line-soft" />
                            </td>
                        </tr>
                    ))
                ) : filas.length === 0 ? (
                    <tr className="bg-surface">
                        <td colSpan={COLUMNAS} className={`${claseTd} h-auto py-12`}>
                            <Inbox size={32} strokeWidth={1.5} className="mx-auto text-line-input" />
                            <p className="mt-2 text-sm font-medium text-ink">No hay órdenes para mostrar</p>
                            <p className="text-xs text-label">Prueba cambiando los filtros.</p>
                        </td>
                    </tr>
                ) : (
                    <>
                        {filas.map((orden) => {
                            const nombre = nombreTecnico(orden.docTecnico);
                            return (
                                <tr key={orden.ordenTrabajoId} className="bg-surface transition-colors hover:bg-hover">
                                    <td className={`${claseTd} ${fijaSot}`}>
                                        <span className="inline-flex items-center gap-1.5 font-bold">
                                            <FileText size={16} strokeWidth={1.75} className="text-ink" /> {orden.sot}
                                        </span>
                                    </td>
                                    <td className={claseTd}>
                                        {nombre ?? <span className="text-placeholder">Sin coincidencia</span>}
                                    </td>
                                    <td className={`${claseTd} px-1`}>
                                        <CeldaEditable
                                            tipo="texto"
                                            valor={orden.docTecnico}
                                            alinear="centro"
                                            deshabilitada={!puedeEditarCampos}
                                            onGuardar={(v) => guardar(orden.ordenTrabajoId, { docTecnico: v })}
                                        />
                                    </td>
                                    <td className={`${claseTd} max-w-sm px-1 text-left`}>
                                        <CeldaEditable
                                            tipo="texto"
                                            valor={orden.trabajoRealizado}
                                            maxLength={MAX_TRABAJO_REALIZADO}
                                            deshabilitada={!puedeEditarCampos}
                                            mostrar={orden.trabajoRealizado || <span className="text-placeholder">Sin descripción</span>}
                                            onGuardar={(v) => guardar(orden.ordenTrabajoId, { trabajoRealizado: v })}
                                        />
                                    </td>
                                    <td className={`${claseTd} px-1`}>
                                        <CeldaEditable
                                            tipo="select"
                                            valor={String(orden.estadoCampo)}
                                            opciones={opcionesEstado}
                                            alinear="centro"
                                            deshabilitada={!puedeEditarCampos}
                                            mostrar={<EstadoMapeado grupo="campo" valor={orden.estadoCampo} />}
                                            onGuardar={(v) => guardar(orden.ordenTrabajoId, { estadoCampo: Number(v) as EstadoClaro })}
                                        />
                                    </td>
                                    <td className={claseTd}>
                                        {orden.archivos.length > 0 ? (
                                            <button
                                                type="button"
                                                onClick={() => onVerImagenes(orden)}
                                                className="inline-flex items-center gap-1.5 rounded-control px-2 py-1 font-medium text-info transition-colors hover:bg-hover"
                                            >
                                                <Images size={16} strokeWidth={1.75} /> {orden.archivos.length}
                                            </button>
                                        ) : (
                                            <span className="text-placeholder">Sin imágenes</span>
                                        )}
                                    </td>
                                    <td className={`${claseTd} ${fijaAcciones} px-1`}>
                                        <div className="flex items-center justify-center gap-0.5">
                                            <MenuDinamico
                                                opciones={[
                                                    { label: 'Editar', icono: <Edit2 size={16} />, accion: () => editar(orden) },
                                                    { label: 'Ver imágenes', icono: <ImageIcon size={16} />, accion: () => onVerImagenes(orden) },
                                                    { label: 'Eliminar', icono: <Trash2 size={16} />, accion: () => onEliminar(orden), opcionAdviser: true },
                                                ]}
                                            />
                                            <CeldaChevron titulo="Abrir la orden" onClick={() => editar(orden)} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {/* filas vacías para mantener el aspecto de hoja */}
                        <FilasRelleno actuales={filas.length} columnas={COLUMNAS} />
                    </>
                )}
            </tbody>
        </table>
    );
};
