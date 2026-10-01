import type{ImagenesResponse} from "../../types/Ordenes";
import { Image , CloudUpload, X, ChevronLeft, ChevronRight, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "../Cards/Card";

interface ContenedorImgProps{
    imagenes : ImagenesResponse[],
    onDelete? : (index:number) => void;
    onAgregar? : (archivos: File[]) => void;
}
const BASE_URL = import.meta.env.VITE_API_URL2;

export const ContenedorImagenes = ({imagenes,onDelete,onAgregar}:ContenedorImgProps) => {
    // índice de la imagen abierta en el visor; null = visor cerrado
    const [abierta, setAbierta] = useState<number | null>(null);

    const anterior = () => setAbierta((i) => i === null ? i : (i - 1 + imagenes.length) % imagenes.length);
    const siguiente = () => setAbierta((i) => i === null ? i : (i + 1) % imagenes.length);

    // teclado solo mientras el visor está abierto
    useEffect(() => {
        if (abierta === null) return;
        const alPresionar = (e: KeyboardEvent) => {
            if (e.key === "Escape") setAbierta(null);
            if (e.key === "ArrowLeft") anterior();
            if (e.key === "ArrowRight") siguiente();
        };
        window.addEventListener("keydown", alPresionar);
        return () => window.removeEventListener("keydown", alPresionar);
    }, [abierta, imagenes.length]);

    return(
        <Card
            title="Imágenes"
            subtitle={`${imagenes.length} ${imagenes.length === 1 ? "imagen" : "imágenes"} adjuntas`}
            icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Image size={20} />
                </div>
            }
        >

            {imagenes.length > 0 ? ( 
                <div className="mt-4 grid grid-cols-3 gap-2">
                    {imagenes.map((img, index) => (
                        <div key={img.archivoId ?? index} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                            <img
                                src={`${BASE_URL}${img.src}`}
                                alt={img.nombreArchivo}
                                onClick={() => setAbierta(index)}
                                className="h-full w-full cursor-zoom-in object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                           
                            {onDelete && (
                                <button
                                    type="button"
                                    onClick={() => onDelete(index)}
                                    className="absolute right-1 top-1 rounded-md bg-white/90 p-1 text-red-600 opacity-0 shadow-sm transition-opacity hover:bg-white group-hover:opacity-100"
                                    title="Eliminar imagen"
                                >
                                    <Trash size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="mt-4 text-center text-sm italic text-slate-400">No hay imágenes adjuntas.</p>
            )}

            {abierta !== null && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
                    onClick={() => setAbierta(null)}
                >
                    <button
                        type="button"
                        onClick={() => setAbierta(null)}
                        className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
                        title="Cerrar (Esc)"
                    >
                        <X size={28} />
                    </button>

                    {imagenes.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); anterior(); }}
                                className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                                title="Anterior"
                            >
                                <ChevronLeft size={28} />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); siguiente(); }}
                                className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                                title="Siguiente"
                            >
                                <ChevronRight size={28} />
                            </button>
                        </>
                    )}

                    <figure className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={`${BASE_URL}${imagenes[abierta].src}`}
                            alt={imagenes[abierta].nombreArchivo}
                            className="max-h-[80vh] max-w-[85vw] rounded-lg object-contain shadow-2xl"
                        />
                        <figcaption className="text-sm text-white/70">
                            {imagenes[abierta].nombreArchivo} · {abierta + 1} / {imagenes.length}
                        </figcaption>
                    </figure>
                </div>
            )}
        </Card>
    );
}
