import { useModal } from '../hooks/useModal';
import { useServicios } from '../hooks/servicio/useServicios';
import { ServiciosTable } from '../components/Servicios/ServiciosTable';
import { Modal } from '../components/shared/Modal';
import { ServicioForm } from '../components/Servicios/ServicioForm';
import type { Servicio } from '../types/servicio';

export const ServiciosPage = () => {
    const { servicios, isLoading, error } = useServicios();
    
    // Usamos el hook inyectándole el tipo <Servicio> para que TypeScript sepa de qué hablamos
    const { 
      isOpen, 
      itemToEdit, 
      openForCreate, 
      openForEdit, 
      closeModal 
    } = useModal<Servicio>();
  
    const handleGuardarServicio = async (datosFormulario: Partial<Servicio>) => {
      // Aquí irá la llamada POST/PUT hacia tu API
      console.log("Datos capturados del formulario:", datosFormulario);
      closeModal();
    };

    return (
    <div className="flex flex-col gap-6">
        {/* Cabecera */}
        <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Servicios</h1>
            <p className="text-sm text-gray-500 mt-1">Administra el catálogo de servicios</p>
        </div>
        <button 
            onClick={openForCreate} // <-- Usamos la función directa del hook
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md transition-colors flex items-center gap-2"
        >
            <span>+</span> Nuevo Servicio
        </button>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

        {/* Contenedor de la Tabla */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <ServiciosTable 
            servicios={servicios} 
            isLoading={isLoading} 
            onEdit={openForEdit} // <-- Usamos la función directa del hook
        />
        </div>

        {/* Renderizado Condicional del Modal */}
        <Modal 
        isOpen={isOpen} 
        onClose={closeModal}
        title={itemToEdit ? 'Editar Servicio' : 'Registrar Nuevo Servicio'}
        >
        <ServicioForm 
            initialData={itemToEdit}
            onSubmit={handleGuardarServicio}
            onCancel={closeModal}
        />
        </Modal>
    </div>
    );
};