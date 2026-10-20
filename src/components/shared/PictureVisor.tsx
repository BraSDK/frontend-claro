
import type {ImagenesResponse} from "../../types/Ordenes";
import { useState} from "react";
interface  VisorProps {
   imgs : ImagenesResponse[];
}
const BASE_URL = import.meta.env.VITE_API_URL2;
export const PictureVisor = ({imgs} :VisorProps) => {
const [active,setActive] = useState<number>(0)
const imagenActual = imgs[active]; 
if (imgs.length === 0) return <p className="text-sm italic text-slate-400">Sin imágenes</p>;
    return(
        <div>
            {imgs.length <1 && ("sin imagenes") }
                <div>
                        <div>
                           <figure className="flex h-80 w-full items-center justify-center rounded-lg bg-slate-50" onClick={(e) => e.stopPropagation()}>
                            { active !== null && (
                                <img
                                    src={`${BASE_URL}${imagenActual.src}`}
                                    className="max-h-full max-w-full rounded-lg object-contain"
                                />
                            )}
                                <figcaption className="text-sm text-white/70">
                                    {imgs.length}
                                </figcaption>
                            </figure>

                        </div>
                </div>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                        {imgs.map((img, index) => (
                        <button
                            key={img.archivoId ?? index}
                            type="button"
                            onClick={() => setActive(index)}
                            className={`h-30 w-30 overflow-hidden rounded-md border-2 transition-all ${
                                index === active
                                    ? "border-blue-500"
                                    : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                        >
                            <img
                                src={`${BASE_URL}${img.src}`}
                                alt={img.nombreArchivo}
                                className="h-full w-full object-cover"
                            />
                        </button>
                        ))}
                </div>
        </div>

    )

}
