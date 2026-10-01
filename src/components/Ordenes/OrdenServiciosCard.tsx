import { Card } from "../Cards/Card";
import { Plus} from "lucide-react";
import {  FormDetalleServicio  } from "./FormDetalleServicio";
import { useState, useId} from "react";
import { ModalSmall } from "../shared/ModalSmall";
import type { OrdenDetalleTrabajo } from "../../types/Ordenes";
import { TablaDetalles } from "./TablaDetalles";


interface OrdenServiciosCardProps{
    detalles:OrdenDetalleTrabajo[];
    onAgregar : (detalle: OrdenDetalleTrabajo) => void;
    onEliminar : (index: number) => void;
}

export const OrdenServiciosCard= ({detalles,onAgregar,onEliminar}:OrdenServiciosCardProps) => {

    // detalles viene de la página padre; aquí solo se muestran y se avisa de cambios
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const formId = useId();
    
    const handleAgregar = (detalle:OrdenDetalleTrabajo) => {
        console.log("Ejecutado a la primera");
        onAgregar(detalle);
        setIsModalOpen(false);
    }

    //manejaremos los index para lo visual y para el back el codigo
    const handleDelete = (index:number) => {
        onEliminar(index);
    }
    
    return(
        <div>
            <Card
                title="Servicios realizados"
                subtitle="Agrega los servicios que se realizaron en esta orden de trabajo."
                actions={
                    <div className="relative inline-block text-left">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                        >
                            <Plus height={20} className="mr-1" />
                                Agregar servicio
                        </button>

                        {/* 2. El modal se posiciona de forma absoluta justo debajo del botón */}
                        {isModalOpen && (
                            <div className="absolute right-0 mt-2 z-50 w-[420px] rounded-lg bg-white shadow-2xl border border-gray-100 overflow-hidden">
                                <ModalSmall
                                    title="Agregar servicio"
                                    isOpen={isModalOpen}
                                    onClose={() => setIsModalOpen(false)}
                                    formId={formId}
                                    submitLabel="Agregar"
                                   
                                >
                                    <FormDetalleServicio 
                                        formId={formId} 
                                        onSubmit={handleAgregar}                                         
                                    />
                                </ModalSmall>
                            </div>
                        )}
                    </div>
                }
                 
            > 
            <TablaDetalles 
                detalles={detalles}
                onDelete={onEliminar}
            />
            </Card>        
        </div>
    );
}