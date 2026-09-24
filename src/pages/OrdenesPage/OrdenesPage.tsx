import { useOrdenTrabajo } from '../../hooks/ordenes/useOrden';
import { OrdenesTable } from '../../components/Ordenes/OrdenesList';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { WorkflowIcon } from 'lucide-react';
export const OrdenesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { OrdenesT , error , isLoading, refetch ,EliminarOrden} = useOrdenTrabajo({ 
        pagina : 1,
        cantidadPorPagina : 15
    });
    useEffect(() => {
        refetch();
    }, [location.key]);
    
    const handleDelete = (id:number) => {
        EliminarOrden(id);
    };

    return (
        <div className="flex flex-col gap-6">
        {/* Cabecera */}

        <div className="flex items-center justify-between">
        {/* Ícono */}
        <div className="flex items-center gap-4">
            <div className="flex items-center justify-center">
                <WorkflowIcon size={38} className="text-gray-900" />
            </div>

            {/* Título y descripción */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                Ordenes de trabajo
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                Sube y registra tus órdenes de trabajo
                </p>
            </div>


        </div>


        <button className='bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md transition-colors flex items-center gap-2'
                onClick={() => navigate('/ordenesCrear')}>
                + Nueva orden
        </button>


        
        </div>

            {/* Tabla con las ordenes registradas */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <OrdenesTable 
                    ordenes={OrdenesT} 
                    isLoading={isLoading} 
                    onDelete={handleDelete}
                />
                
            </div>
        </div>

    );
};
