import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { urlArchivo } from "../../services/Ordenes/OrdenesTrabajo.service";
import type { ArchivoOrden } from "../../types/Ordenes";

// Visor de imágenes de una orden: imagen grande, flechas y miniaturas
export const PictureVisor = ({ imgs, inicial = 0 }: { imgs: ArchivoOrden[]; inicial?: number }) => {
    const [activa, setActiva] = useState(inicial);

    if (imgs.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 py-10 text-label">
                <ImageOff size={32} strokeWidth={1.5} />
                <p className="italic">Sin imágenes</p>
            </div>
        );
    }

    const actual = imgs[Math.min(activa, imgs.length - 1)];
    const mover = (paso: number) => setActiva((i) => (i + paso + imgs.length) % imgs.length);
    const claseFlecha = "absolute top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-ink transition-colors hover:bg-surface";

    return (
        <div>
            <figure className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-control bg-page">
                <img src={urlArchivo(actual)} alt={actual.nombreArchivo} className="max-h-full max-w-full object-contain" />
                {imgs.length > 1 && (
                    <>
                        <button type="button" onClick={() => mover(-1)} className={`${claseFlecha} left-3`} aria-label="Anterior">
                            <ChevronLeft size={18} strokeWidth={1.75} />
                        </button>
                        <button type="button" onClick={() => mover(1)} className={`${claseFlecha} right-3`} aria-label="Siguiente">
                            <ChevronRight size={18} strokeWidth={1.75} />
                        </button>
                    </>
                )}
                <figcaption className="absolute bottom-2 right-3 rounded-badge bg-ink/70 px-2.5 text-xs font-semibold text-white">
                    {activa + 1} / {imgs.length}
                </figcaption>
            </figure>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
                {imgs.map((img, i) => (
                    <button
                        key={img.archivoId}
                        type="button"
                        onClick={() => setActiva(i)}
                        title={img.nombreArchivo}
                        className={`h-16 w-16 overflow-hidden rounded-control border-2 transition ${i === activa ? "border-info" : "border-transparent opacity-60 hover:opacity-100"}`}
                    >
                        <img src={urlArchivo(img)} alt={img.nombreArchivo} className="h-full w-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
};
