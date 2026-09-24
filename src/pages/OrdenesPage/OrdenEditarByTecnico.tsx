import { EditarOrdenByTecnico } from '../../components/Ordenes/OrdenesFormEditarTecnico'
import { useOrdenTrabajo } from '../../hooks/ordenes/useOrden';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import type { CambiosTecnico } from '../../types/Ordenes';



export const OrdenEditarByTecnico = () => {

    const { isLoading , ordenSeleccionada,TraerPorId,EditarOrden} = useOrdenTrabajo();
    const { id } = useParams<{ id: string }>();
    const  navigate  = useNavigate();

    useEffect( () => {
        TraerPorId(Number(id));
        console.log(ordenSeleccionada?.descripcion);
    },[id]);

    const onSubmit = (id:number,orden:CambiosTecnico) => {
        console.log("editado")
        EditarOrden(id,orden);
        navigate('/ordenes')
    }

    if(isLoading || !ordenSeleccionada) return <div> Cargando......</div>

    return(
        <EditarOrdenByTecnico
            initialData={ordenSeleccionada}
            onCancel={() => navigate('/ordenes')}
            onSubmit={onSubmit}
        />
    )

}