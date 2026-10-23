import { Filter } from 'lucide-react';
import { useModal } from '../hooks/useModal';
import { Modal } from '../components/shared/Modal';

import { useServicios } from '../hooks/servicio/useServicios';
import { ServicioForm } from '../components/Servicios/ServicioForm';
import { ServiciosTable } from '../components/Servicios/ServiciosTable';
import { useServiciosFilter } from '../hooks/servicio/useServiciosFilter';
import { ServiciosFilterDrawer } from '../components/Servicios/ServiciosFilterDrawer';

import type { Servicio } from '../types/servicio';


export const ServiciosPage = () => {
    const { servicios, isLoading, error, editServicios, createServicios, removeServicios } = useServicios();
    
    // Usamos el hook inyectándole el tipo <Servicio> para que TypeScript sepa de qué hablamos
    const { 
      isOpen, 
      itemToEdit, 
      openForCreate, 
      openForEdit, 
      closeModal 
    } = useModal<Servicio>();

    // Hook para la Lógica de Filtros y Drawer
    const {
        isFilterOpen,
        serviciosFiltrados,
        openFilter,
        closeFilter,
        applyFilters,
        resetFilters,
    } = useServiciosFilter(servicios);
    
    const handleGuardarServicio = async (datosFormulario: Partial<Servicio>) => {
      try{
        if(itemToEdit) {
            console.log("LO QUE REALMENTE ENVIÓ EL BACKEND:", itemToEdit);
            //Modo Edicion
            await editServicios(itemToEdit.codigo, datosFormulario);
        }else {
            //Modo Registro
            await createServicios(datosFormulario);
        }
        //Solo si la peticion es exitosa
        closeModal();
      }catch(err){
        console.error("Fallo al guardar el servicio:", err);
        alert("Fallo la petición, mira el error en la consola.");
      }
    };

    const handleEliminarServicio = async (codigo: number) => {
        const confirmar = window.confirm("¿Es(tas seguro de que deseas eliminar este servicio?");

        if (confirmar) {
            try{
                await removeServicios(codigo);
            }catch(err){
                console.log("Fallto al eliminar", err);
                alert("Hubo un error al intentar eliminar el servicio.");
            }
        }
    };

    return (
        <div className="flex flex-col gap-6">
          {/* Cabecera */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-ink">Gestión de Servicios</h1>
              <p className="text-sm text-label mt-1">Administra el catálogo de servicios</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Botón Filtros */}
              <button
                onClick={openFilter}
                className="bg-page hover:bg-line text-ink px-4 py-2.5 rounded-pill text-sm font-medium transition-colors flex items-center gap-2 border border-line"
              >
                <Filter size={16} />
                Filtros
              </button>
    
              {/* Botón Nuevo Servicio */}
              <button 
                onClick={openForCreate}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-pill bg-brand px-5 text-sm font-semibold text-on-primary transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>+</span> Nuevo Servicio
              </button>
            </div>
          </div>
    
          {error && <div className="p-4 bg-danger-soft text-danger rounded-control">{error}</div>}
    
          {/* Tabla con datos filtrados mediante el Hook */}
          <div className="bg-surface rounded-card border border-line overflow-hidden">
            <ServiciosTable 
              servicios={serviciosFiltrados} 
              isLoading={isLoading} 
              onEdit={openForEdit}
              onDelete={handleEliminarServicio}
            />
          </div>
    
          {/* Modal de Formulario */}
          <Modal 
            isOpen={isOpen} 
            onClose={closeModal}
            title={itemToEdit ? 'Editar Servicio' : 'Registrar Nuevo Servicio'}
          >
            {isOpen && (
              <ServicioForm 
                initialData={itemToEdit}
                onSubmit={handleGuardarServicio}
                onCancel={closeModal}
              />
            )}
          </Modal>
    
          {/* Drawer de Filtros */}
          <ServiciosFilterDrawer
            isOpen={isFilterOpen}
            onClose={closeFilter}
            onApplyFilters={applyFilters}
            onResetFilters={resetFilters}
          />
        </div>
      );
    };