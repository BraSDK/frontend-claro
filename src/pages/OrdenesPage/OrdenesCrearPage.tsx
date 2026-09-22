import { useModal } from '../../hooks/useModal';
import { useOrdenTrabajo } from '../../hooks/ordenes/useOrden';
import { useNavigate } from 'react-router-dom';
import { OrdenForm } from '../../components/Ordenes/OrdenesForm';
import { Modal } from '../../components/shared/Modal';
import type { OrdenDetalleTrabajo , OrdenTrabajoList } from '../../types/Ordenes';

export const OrdenesCrearPage = () => {
    const navigate = useNavigate();

    const handleCancelar = () => {
        navigate('/ordenes');
    };

    return (
        <>
            {/* Tabla con las ordenes registradas */}
                <OrdenForm
                    onCancel={handleCancelar}
                />
    
        </>
    );
};
