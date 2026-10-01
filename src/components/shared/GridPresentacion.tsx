import { List, Tag } from "lucide-react";
import type{OrdenTrabajoDetalleResponse}from "../../types/Ordenes";
 
interface Props{
    ordenDetalle:OrdenTrabajoDetalleResponse
}
export const GridPresentation = ({ordenDetalle}:Props) => {
    return(
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-6 py-5 my-4">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {/* Total servicios */}
                            <div className="flex items-start gap-4 border-b border-slate-200 pb-4 md:border-b-0 md:border-r md:pb-0">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <List size={20} />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                    Total de servicios
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-slate-900">
                                        {ordenDetalle.detalles?.length}
                                    </p>
                                </div>
                            </div>


                            {/* Precio total */}
                            <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-5 py-3">
                                <div>
                                    <p className="text-sm font-medium text-blue-500">
                                    Precio total
                                    </p>

                                    <p className="mt-1 text-xl font-bold text-blue-700">
                                    { ordenDetalle.detalles?.reduce((acumulador, detalle) => acumulador+ (detalle.precioTotal || 0),0)}
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                                    <Tag size={20} />
                                </div>
                            </div>
                        </div>
                    </div >
    );
}