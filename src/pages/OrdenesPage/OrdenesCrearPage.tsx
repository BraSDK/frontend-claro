import { useNavigate } from 'react-router-dom';
import { OrdenForm } from '../../components/Ordenes/OrdenesForm';
import { DockIcon } from 'lucide-react';
import { useOrdenTrabajo } from '../../hooks/ordenes/useOrden';
import type { OrdenInicialRequest} from '../../types/Ordenes';
export const OrdenesCrearPage = () => {
    const {CrearOrden}= useOrdenTrabajo();
    const navigate = useNavigate();

    const handleCancelar = () => {
        navigate('/ordenes');
    };
    
    const handleOnSubmit = (orden:OrdenInicialRequest) => {

        CrearOrden(orden);
        navigate('/ordenes');
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center gap-4 mb-8">
            {/* Icono */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                <DockIcon
                size={25}
                strokeWidth={2}
                className="text-red-600"
                />
            </div>

            {/* Título */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Nueva orden de trabajo
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                Registrar informacion del trabajo realizado
                </p>
            </div>

            
            </div>
            {/* Contenido Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

                    {/* FORMULARIO */}
                    <OrdenForm
                        onCancel={handleCancelar}
                        isEdited = {false}
                        onSubmit={handleOnSubmit}
                    />

                    {/* PANEL LATERAL */}
                    <aside className="rounded-2xl border border-gray-200 bg-white p-5">
                        <h2 className="text-sm font-semibold text-gray-900 mb-5">
                            Crear orden
                        </h2>
                        <div className="space-y-5">
                            {/* Paso 1 */}
                            <div className="flex items-start gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
                                1
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                Información
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                Datos de la orden
                                </p>
                            </div>
                            </div>
                            {/* Paso 2 */}
                            <div className="flex items-start gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                                2
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                Evidencias
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                Imágenes del trabajo
                                </p>
                            </div>
                            </div>
                            {/* Paso 3 */}
                            <div className="flex items-start gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                                3
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                Confirmación
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                Revisar y registrar
                                </p>
                            </div>
                            </div>

                        </div>
                    </aside>
            </div>



    
        </div>
    );
};
