import { use, useEffect, useState } from "react";
import {EstadoFotos , type OrdenTrabajo, type validarImagen}  from "../../types/Ordenes";
import { validarImagenes } from "../../hooks/ordenes/useOrden";
import { CheckGuardado } from "../../components/shared/Check";

export const RevisionFotos = ({ordenId,onSave}:{ordenId:number; onSave:(orden:OrdenTrabajo) => void}) =>{
    const [observacion, setObservacion] = useState<string>();
    const [estado , setEstado] = useState<EstadoFotos>(0);
    const [visible, setVisible] = useState<boolean>(false);
    const [validarImg, setValidarImg] = useState<validarImagen | null>(null)


    const handleEnviar = async (estado: EstadoFotos, texto?:string ) => {
        const orden= await validarImagenes(ordenId,{estadoAlmacen: estado,observacion:texto});
        if(!orden){
            return;
        }

        onSave(orden);
    }

    return (
        <>
            <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 ">
                {/* fila de botones, alineada a la derecha */}
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setVisible(!visible)}
                        className="rounded-control border border-danger/40 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger-soft"
                    >
                        Observar
                    </button>
                    <button
                        onClick={() => {handleEnviar(EstadoFotos.CORRECTO)}}
                        disabled={visible}
                        type="button"
                        className="rounded-control bg-success px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                    >
                        ✓ Correcto
                    </button>
                </div>

                {/* la observación aparece debajo, a lo ancho */}
                {visible && (
                    <div className="flex flex-col items-end gap-2">
                        <textarea
                            rows={3}
                            placeholder="¿Qué está mal en las fotos?"
                            className="w-full resize-none rounded-control border border-line px-3 py-2 text-sm outline-none focus:border-danger focus:ring-2 focus:ring-danger/20"
                            onChange={(e) => setObservacion(e.target.value)}
                        />
                        <button 
                            type="button" 
                            className="w-auto rounded-control bg-success px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
                            onClick={() => { handleEnviar(EstadoFotos.OBSERVADO,observacion) }}
                        >
                         Enviar
                        </button>
                    </div>

                )}
            </div>

        </>
    );
}