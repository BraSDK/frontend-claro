import { useOrdenTrabajo } from '../../hooks/ordenes/useOrden';
import { OrdenesTable } from '../../components/Ordenes/OrdenesList';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
export const OrdenesPage = () => {
    const location = useLocation();
    const { OrdenesT , error , isLoading, refetch } = useOrdenTrabajo({ 
        pagina : 1,
        cantidadPorPagina : 15
    });
    useEffect(() => {
        refetch();
    }, [location.key]);


    return (
        <>
            {/* Tabla con las ordenes registradas */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <OrdenesTable 
                    ordenes={OrdenesT} 
                    isLoading={isLoading} 
                />
                
            </div>
        </>
    );
};
