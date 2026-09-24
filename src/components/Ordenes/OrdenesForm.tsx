import { useState } from 'react';
import type { OrdenInicialRequest ,OrdenTrabajo ,Imagenes} from '../../types/Ordenes';
import { X } from 'lucide-react';
import { FileText,CloudUpload} from "lucide-react";
import { useAuth } from '../../hooks/useAuth';
interface OrdenFormProps {
  initialData?: OrdenTrabajo | null; 
  onSubmit?: (data: OrdenInicialRequest) => void;
  onCancel: () => void;
  isEdited:boolean;
}

export const OrdenForm = ({ initialData , onSubmit, onCancel,isEdited}: OrdenFormProps) => {
    const {UsuarioId} = useAuth();
    const [dataInicial,setDataInicial] = useState({
        codigo: initialData?.OrdenId || 0,
        sot: initialData?.Sot || "",
        descripcion: initialData?.Descripcion || "",
        estado : initialData?.Estado || 0,
        precioTotal : initialData?.PrecioTotal || 0.0,
        Imagenes : initialData?.Imagenes || [],
        Detalles : initialData?.Detalles || []
    });



    //Para envair la cracion de data nueva
    const [dataNueva,setDataNueva] = useState<OrdenInicialRequest>({
                Sot : 0,
                Descripcion : "",
                UsuarioId : UsuarioId,
                Estado: 0,
                Imagenes : []
    });


    const [dataEnvio, setDataEnvio]  =useState<Imagenes[]>([]);

    const handleSubmit= (e: React.FormEvent) => {
        e.preventDefault(); //aqui frenamos el envio del formulario!!
            onSubmit?.(dataNueva);
        
    };

    const eliminarImagen = (index:number) => {
        setDataNueva((data) => {
            URL.revokeObjectURL(data.Imagenes[index].url);
            return {...data,Imagenes: data.Imagenes.filter((_, i) => i !== index)};
        })
    }

    const handleImagenesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files) return;

            const nuevasImagenes: Imagenes[]= Array.from(files).map(file => ({
                nombreArchivo: file.name,
                src: file,
                url: URL.createObjectURL(file), 
            }));
            
            setDataNueva((data)=> ({...data,Imagenes:[...data.Imagenes, ...nuevasImagenes]}));

    };
    return (
        <div className='className="rounded-2xl border border-gray-200 bg-white p-5'>
            <form onSubmit={handleSubmit} className="w-full space-y-5">
                        <div className="block display space-y-4 ">
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 ">
                                      <label className="mb-2 block text-xs font-medium text-gray-700">
                                            SOT <span className="text-red-500">*</span>
                                        </label>
                                      <div className="relative">
                                            <input
                                                onChange={(e) => setDataNueva((data) =>({ ...data, Sot: Number(e.target.value) }))}
                                                type="text"
                                                required
                                                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
                                                placeholder="Ej. 12345678"
                                                />
                                        </div>

                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1"> Descripcion del trabajo : </label>
                                    <textarea
                                        onChange={(e) => setDataNueva((data) => ({...data,Descripcion:e.target.value}))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                                    />
                                </div>
                                <label className="mb-2 block text-xs font-medium text-gray-700">
                                            Insertar imagenes <span className="text-red-500">*</span>
                                </label>
                                <label className='rounded-2xl border border-dotted border-slate-500 bg-slate-50/70 p-4 flex min-h-[175px] flex-col items-center justify-center text-center transition-colors hover:border-red-300 hover:bg-slate-50/50'>
                                    <label className="block text-sm font-medium text-slate-300 mb-1"> insertar imagenes* </label>
                                    <CloudUpload
                                        size={32}
                                        strokeWidth={1.8}
                                        className="mb-2 text-slate-300"
                                    />
                                    <input
                                        type='file'
                                        multiple
                                        accept="image/*"
                                        onChange={handleImagenesChange}
                                        className="hidden"
                                    />
                                </label>
                                {/* Preview de imágenes ya seleccionadas */}
                                    {dataNueva.Imagenes.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {dataNueva.Imagenes.map((img, index) => (
                                            <div key={index} className="relative w-20 h-20">
                                                <img
                                                src={img.url}
                                                alt={img.nombreArchivo}
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
        </div>
       
    );


};