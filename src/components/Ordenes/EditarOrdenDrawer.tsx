import { useEffect, useState } from 'react';
import { ImagePlus, Trash2, X } from 'lucide-react';
import { MAPEO_ESTADOS } from '../ui/StatusBadge';
import {
    agregarArchivos,
    edicionRapida,
    eliminarArchivo,
    urlArchivo,
} from '../../services/Ordenes/OrdenesTrabajo.service';
import {
    MAX_TRABAJO_REALIZADO,
    type ArchivoOrden,
    type EstadoClaro,
    type OrdenTrabajo,
} from '../../types/Ordenes';

interface Props {
    orden: OrdenTrabajo | null;
    esTecnico?: boolean;
    puedeGestionarImagenes?: boolean;
    rolUsuario?: string | null;
    onCerrar: () => void;
    onGuardado: () => void;
}

export const EditarOrdenDrawer = ({ orden, esTecnico = false, rolUsuario, onCerrar, onGuardado }: Props) => {
    const [sot, setSot] = useState('');
    const [estadoCampo, setEstadoCampo] = useState<EstadoClaro>(0 as EstadoClaro);
    const [trabajoRealizado, setTrabajoRealizado] = useState('');

    // Gestión de fotos (quitar existentes y/o agregar nuevas)
    const [archivosActuales, setArchivosActuales] = useState<ArchivoOrden[]>([]);
    const [idsEliminar, setIdsEliminar] = useState<number[]>([]);
    const [archivosNuevos, setArchivosNuevos] = useState<File[]>([]);
    const [previewsNuevos, setPreviewsNuevos] = useState<string[]>([]);

    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orden) return;
        setSot(String(orden.sot));
        setEstadoCampo(orden.estadoCampo);
        setTrabajoRealizado(orden.trabajoRealizado ?? '');
        setArchivosActuales(orden.archivos ?? []);
        setIdsEliminar([]);
        setArchivosNuevos([]);
        setError(null);
    }, [orden]);

    useEffect(() => {
        const urls = archivosNuevos.map((file) => URL.createObjectURL(file));
        setPreviewsNuevos(urls);
        return () => urls.forEach((url) => URL.revokeObjectURL(url));
    }, [archivosNuevos]);

    if (!orden) return null;

    const marcarParaEliminar = (archivoId: number) => {
        setIdsEliminar((prev) => [...prev, archivoId]);
        setArchivosActuales((prev) => prev.filter((a) => a.archivoId !== archivoId));
    };

    const seleccionarNuevasFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;
        setArchivosNuevos((prev) => [...prev, ...files]);
        e.target.value = '';
    };

    const quitarFotoNueva = (index: number) => {
        setArchivosNuevos((prev) => prev.filter((_, i) => i !== index));
    };

    const manejarSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const sotNum = Number(sot);
        if (!sotNum || sotNum <= 0) {
            setError('Ingresa un número de SOT válido.');
            return;
        }

        setGuardando(true);
        setError(null);
        try {
            await edicionRapida(orden.ordenTrabajoId, {
                sot: sotNum,
                estadoCampo,
                trabajoRealizado: trabajoRealizado.trim(),
            });

            if (idsEliminar.length > 0) {
                await Promise.all(
                    idsEliminar.map((archivoId) => eliminarArchivo(orden.ordenTrabajoId, archivoId))
                );
            }

            if (archivosNuevos.length > 0) {
                await agregarArchivos(orden.ordenTrabajoId, archivosNuevos);
            }

            onGuardado();
            onCerrar();
        } catch (err: any) {
            setError(err?.response?.data?.error || err?.message || 'No se pudo actualizar la orden.');
        } finally {
            setGuardando(false);
        }
    };
    const puedeEditarFotos = rolUsuario === 'ADMIN' || rolUsuario === 'TECNICO';
    const totalFotos = archivosActuales.length + archivosNuevos.length;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 backdrop-blur-[1px] sm:items-stretch"
            onClick={onCerrar}
        >
            <div
                className="flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-h-none sm:max-w-md sm:rounded-none"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Cabecera */}
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <div>
                        <h3 className="text-base font-semibold text-ink">
                            Editar Orden #{orden.ordenTrabajoId}
                        </h3>
                        {esTecnico && (
                            <p className="text-xs text-muted">
                                Editable mientras las fotos estén sin validar
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="cursor-pointer rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Cerrar"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={manejarSubmit} className="flex flex-1 flex-col justify-between overflow-y-auto p-5">
                    <div className="flex flex-col gap-4">
                        {error && (
                            <p className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">
                                {error}
                            </p>
                        )}

                        <div>
                            <label className="mb-1 block text-xs font-medium text-ink">
                                Número de SOT
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={sot}
                                onChange={(e) => setSot(e.target.value.replace(/\D/g, ''))}
                                className="w-full rounded-control border border-gray-300 px-3 py-2.5 font-mono text-sm focus:border-red-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-ink">
                                Estado en campo
                            </label>
                            <select
                                value={estadoCampo}
                                onChange={(e) => setEstadoCampo(Number(e.target.value) as EstadoClaro)}
                                className="w-full rounded-control border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none"
                            >
                                {Object.entries(MAPEO_ESTADOS.campo).map(([valor, info]) => (
                                    <option key={valor} value={valor}>
                                        {info.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="mb-1 flex justify-between text-xs">
                                <label className="font-medium text-ink">Trabajo realizado</label>
                                <span className="text-muted">
                                    {trabajoRealizado.length}/{MAX_TRABAJO_REALIZADO}
                                </span>
                            </div>
                            <textarea
                                rows={3}
                                maxLength={MAX_TRABAJO_REALIZADO}
                                value={trabajoRealizado}
                                onChange={(e) => setTrabajoRealizado(e.target.value)}
                                className="w-full rounded-control border border-gray-300 px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none"
                                placeholder="Describe el trabajo realizado..."
                            />
                        </div>

                        {/* Evidencias fotográficas */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-xs font-medium text-ink">
                                    Evidencias fotográficas ({totalFotos})
                                </label>
                                <label className="inline-flex cursor-pointer items-center gap-1 rounded-control border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">
                                    <ImagePlus size={14} />
                                    <span>Cambiar / Agregar</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={seleccionarNuevasFotos}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {totalFotos === 0 ? (
                                <p className="rounded-control border border-dashed border-gray-300 py-4 text-center text-xs text-muted">
                                    No hay imágenes adjuntas en esta orden.
                                </p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {archivosActuales.map((archivo) => (
                                        <div
                                            key={archivo.archivoId}
                                            className="relative aspect-square overflow-hidden rounded-control border border-gray-200 bg-gray-100"
                                        >
                                            <img
                                                src={urlArchivo(archivo)}
                                                alt={archivo.nombreArchivo}
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => marcarParaEliminar(archivo.archivoId)}
                                                title="Quitar imagen"
                                                className="absolute right-1 top-1 cursor-pointer rounded-full bg-black/65 p-1 text-white hover:bg-red-600"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    ))}

                                    {previewsNuevos.map((url, idx) => (
                                        <div
                                            key={url}
                                            className="relative aspect-square overflow-hidden rounded-control border-2 border-emerald-500 bg-gray-100"
                                        >
                                            <img
                                                src={url}
                                                alt={archivosNuevos[idx]?.name ?? 'Nueva foto'}
                                                className="h-full w-full object-cover"
                                            />
                                            <span className="absolute bottom-1 left-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                                Nueva
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => quitarFotoNueva(idx)}
                                                title="Quitar imagen"
                                                className="absolute right-1 top-1 cursor-pointer rounded-full bg-black/65 p-1 text-white hover:bg-red-600"
                                            >
                                                <X size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pie fijo */}
                    <div className="mt-6 flex gap-2 border-t pt-4">
                        <button
                            type="button"
                            onClick={onCerrar}
                            disabled={guardando}
                            className="flex-1 cursor-pointer rounded-control border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando}
                            className="flex-1 cursor-pointer rounded-control bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            {guardando ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};