import { useRef } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';

export interface ImagenItem {
    clave: string | number;
    src: string;
    nombre: string;
}

interface Props {
    imagenes: ImagenItem[];
    onAgregar?: (archivos: File[]) => void;     // sin esto no se muestra el botón de agregar
    onEliminar?: (clave: ImagenItem['clave']) => void;
    onAbrir?: (indice: number) => void;
    ocupado?: boolean;
}

// Galería de imágenes de la orden: miniaturas + casilla para agregar (click o arrastrar)
export const ImagenesOrden = ({ imagenes, onAgregar, onEliminar, onAbrir, ocupado = false }: Props) => {
    const input = useRef<HTMLInputElement>(null);

    const elegir = (lista: FileList | null) => {
        const archivos = Array.from(lista ?? []).filter((f) => f.type.startsWith('image/'));
        if (archivos.length && onAgregar) onAgregar(archivos);
        if (input.current) input.current.value = '';
    };

    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-3">
            {imagenes.map((img, i) => (
                <figure key={img.clave} className="group relative aspect-square overflow-hidden rounded-control border border-line bg-page">
                    <button type="button" onClick={() => onAbrir?.(i)} className="h-full w-full" title={img.nombre}>
                        <img src={img.src} alt={img.nombre} className="h-full w-full object-cover" />
                    </button>
                    {onEliminar && (
                        <button
                            type="button"
                            onClick={() => onEliminar(img.clave)}
                            disabled={ocupado}
                            title="Quitar imagen"
                            aria-label={`Quitar ${img.nombre}`}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-surface text-danger transition-opacity hover:bg-danger-soft disabled:opacity-40 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                        >
                            <X size={14} strokeWidth={2} />
                        </button>
                    )}
                </figure>
            ))}

            {onAgregar && (
                <button
                    type="button"
                    onClick={() => input.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); elegir(e.dataTransfer.files); }}
                    disabled={ocupado}
                    className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-control border border-dashed border-line-fixed bg-surface text-sm text-label transition-colors hover:border-info hover:bg-info-soft hover:text-info disabled:cursor-wait disabled:opacity-60"
                >
                    {ocupado ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} strokeWidth={1.75} />}
                    {ocupado ? 'Subiendo…' : 'Agregar'}
                </button>
            )}
            <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => elegir(e.target.files)} />

            {imagenes.length === 0 && !onAgregar && <p className="italic text-placeholder">Sin imágenes</p>}
        </div>
    );
};
