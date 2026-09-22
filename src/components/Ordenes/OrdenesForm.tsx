import { useState } from 'react';
import type { OrdenInicialRequest ,OrdenTrabajo ,Imagenes} from '../../types/Ordenes';
import { X } from 'lucide-react';
interface OrdenFormProps {
  initialData?: OrdenTrabajo | null; 
  onSubmit?: (data: Partial<OrdenTrabajo>) => void;
  onCancel: () => void;
}

export const OrdenForm = ({ initialData , onSubmit, onCancel }: OrdenFormProps) => {
    const [dataInicial,setDataInicial] = useState({
        codigo: initialData?.OrdenId || 0,
        sot: initialData?.Sot || "",
        descripcion: initialData?.Descripcion || "",
        estado : initialData?.Estado || 0,
        precioTotal : initialData?.PrecioTotal || 0.0,
        Imagenes : initialData?.Imagenes || [],
        Detalles : initialData?.Detalles || []
    });

    const [dataEnvio, setDataEnvio]  =useState<Imagenes[]>([]);

    const handleSubmit= (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(dataInicial);
    };

    const eliminarImagen = (index:number) => {
        setDataEnvio( prev => {
            URL.revokeObjectURL(prev[index].Url);
            return prev.filter((_, i) => i !== index);
         });
    }

    const handleImagenesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files) return;

            const nuevasImagenes: Imagenes[]= Array.from(files).map(file => ({
                Nombre: file.name,
                Src: file,
                Url: URL.createObjectURL(file), 
            }));

            setDataEnvio((prev) => [...prev,...nuevasImagenes]);
    };
    return (
        <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div className="block display">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"> SOT - Ingresar SOT </label>
                        <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                        placeholder="Ej. 12345678"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"> Descripcion del trabajo : </label>
                        <textarea
                            onChange={() => {}}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"> insertar imagenes: </label>
                        <input
                            type='file'
                            multiple
                            accept="image/*"
                            onChange={handleImagenesChange}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg my-4"
                        />
                        
                        {/* Preview de imágenes ya seleccionadas */}
                        {dataEnvio.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {dataEnvio.map((img, index) => (
                                <div key={index} className="relative w-20 h-20">
                                    <img
                                    src={img.Url}
                                    alt={img.Nombre}
                                    className="w-full h-full object-cover rounded-lg border border-gray-300"
                                    />
                                    <button
                                    type="button"
                                    onClick={() => eliminarImagen(index)}
                                    className="absolute -top-2 -right-2 bg-gray-600 text-white rounded-full p-0.5 shadow-md hover:bg-red-700 transition-colors"
                                    >
                                    <X size={14} />
                                    </button>
                                </div>
                                ))}
                            </div>
                            )}
                    
                    </div>
            </div>


       
            {/* Botones de Acción */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                Cancelar
                </button>
                <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                {initialData ? 'Guardar Cambios' : 'Registrar Orden de Trabajo'}
                </button>
            </div>
        </form>
    );


};