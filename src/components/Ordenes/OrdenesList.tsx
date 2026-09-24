import type{ OrdenTrabajo, OrdenTrabajoList } from '../../types/Ordenes';
import { Trash2 , Edit} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth} from '../../hooks/useAuth';
import { useEffect } from 'react';
interface Propiedades {
  ordenes: OrdenTrabajoList[];
  isLoading: boolean;
  onDelete: (ordenId:number) => void;
}


export const OrdenesTable = ({ ordenes , isLoading , onDelete}:Propiedades) =>{
    const { esTecnico} = useAuth();;
    const navigate = useNavigate();
    

    if(isLoading){
        return <div className="p-8 text-center text-gray-500">Cargando datos...</div>;
    }

    const handleDelete = (ordenId:number) => {
        onDelete(ordenId);
        window.location.reload();   
    }

    const handleEdit = (ordenId:number) => {

        const ruta = esTecnico
        ? `/ordenes/${ordenId}/editar`
        : `/ordenes/${ordenId}/editar`;

        navigate(ruta);
        
    }

  
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Sot</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Descripcion</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {ordenes.length === 0 ? (
                    <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No hay servicios registrados.
                    </td>
                    </tr>
                ) : (
                    ordenes.map(( orden ) => (
                    <tr key={orden.ordenId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-400"> #{orden.ordenId}</td>
                        <td className="px-6 py-4 text-gray-900">{orden.sot}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{orden.estado}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{orden.descripcion}</td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button 
                                    onClick={() => handleEdit(orden.ordenId)}
                                    title="Editar"
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                    <Edit size={18} />
                                </button>

                                <button 
                                    onClick={() => handleDelete(orden.ordenId)}
                                    title="Eliminar"
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>
        );
    };