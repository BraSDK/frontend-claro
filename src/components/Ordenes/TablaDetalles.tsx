import { Wifi,Trash,Wrench} from "lucide-react";
import type { OrdenDetalleTrabajo } from "../../types/Ordenes";

interface TablaDetallesProps {
    detalles: OrdenDetalleTrabajo[];
    onDelete?: (index: number) => void;
}
export const TablaDetalles = ({detalles , onDelete} : TablaDetallesProps) => {
    if (detalles.length == 0 ) return  <div> <p className="text-gray-500 italic p-4 text-center"> No hay detalles agregados a la orden.</p> </div>
    return(
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
                    <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
                        <tr>
                            <th className="px-4 py-3 text-left">Servicio</th>
                            <th className="px-4 py-3 text-center">Cantidad</th>
                            <th className="px-4 py-3 text-right">Costo</th>
                            <th className="px-4 py-3 text-right">Adicional</th>
                            <th className="px-4 py-3 text-right">150</th>
                            <th className="px-4 py-3 text-right">200</th>
                            <th className="px-4 py-3 text-right">300</th>
                            <th className="px-4 py-3 text-right">Precio total </th>
                            {onDelete && <th className="px-4 py-3 text-center"> Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-600">
                        {detalles.map((detalle, index) => {
                            
                            return (
                                
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 flex gap-4 items-center text-blue-600"> <Wrench size={30}/>{detalle.nombreServicio}</td>
                                    <td className="px-4 py-3 text-center"> {detalle.cantidad} </td>
                                    <td className="px-4 py-3 text-center"> {detalle.tipo == 0 ? detalle.precioTotal: "-"}</td>
                                    <td className="px-4 py-3 text-center"> {detalle.tipo == 1 ? detalle.precioTotal: "-"}</td>
                                    <td className="px-4 py-3 text-center"> {detalle.tipo == 2 ? detalle.precioTotal: "-"}</td>
                                    <td className="px-4 py-3 text-center"> {detalle.tipo == 3 ? detalle.precioTotal: "-"}</td>
                                    <td className="px-4 py-3 text-center"> {detalle.tipo == 4 ? detalle.precioTotal: "-"}</td>
                                    <td className="px-4 py-3 text-right font-medium "> <div className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">S/{detalle?.precioTotal?.toFixed(2) || 0}</div></td>
                                    {onDelete && (
                                        <td className="px-4 py-3 text-center">
                                            <button

                                                type="button"
                                                onClick={() => onDelete(index)}
                                                className=" flex items-center gap-4 text-red-600 hover:text-red-800 font-semibold text-xs bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded transition-colors"
                                            >
                                                <Trash 
                                                    size={20}
                                                />
                                                Eliminar
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
    );
};