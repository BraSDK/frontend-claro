import { useState } from 'react';
import { X } from 'lucide-react';
import type { OrdenTrabajoDetalleResponse, CambiosTecnico } from '../../types/Ordenes';
import { useAuth } from '../../hooks/useAuth';
interface ImagenExistente {
  tipo: 'existente';
  ArchivoId: number;
  Url: string;
  Src: string;
}

interface ImagenNueva {
  tipo: 'nueva';
  Archivo: File;
  Preview: string;
}

type ImagenItem = ImagenExistente | ImagenNueva;


interface Propiedades {
  initialData: OrdenTrabajoDetalleResponse;
  onCancel : () => void,
  onSubmit : (id:number, cambios: CambiosTecnico)=> void,
}
const BASE_URL = import.meta.env.VITE_API_URL2;

export const EditarOrdenByTecnico = ({onCancel,onSubmit,initialData}:Propiedades) => {
    const usuario = useAuth();
    const [sot, setSot] = useState(initialData.sot);
    const [descripcion, setDescripcion] = useState(initialData.descripcion);
    const [imagenes, setImagenes] = useState<ImagenItem[]>(
      initialData.imagenes.map((img) => ({
        tipo:'existente'as const,
        ArchivoId: img.archivoId,
        Src: img.src,
        Url: img.src
      }))
    );
    
    const handleImagenesChange = (e: React.ChangeEvent<HTMLInputElement>)=> {
    
      const files = e.target.files;
      if (!files) return;
      const nuevasImagenes: ImagenNueva[] = Array.from(files).map((file) => ({
        tipo: 'nueva',
        Archivo: file,
        Preview: URL.createObjectURL(file),
      }));

      setImagenes((prev) => [...prev, ...nuevasImagenes]);

    }

    const EliminarImagen = (index : number) => {
        setImagenes(prev => 
        {
          const img = prev[index];
          if (img.tipo == 'nueva') URL.revokeObjectURL(img.Preview);
          return prev.filter((_,i)=> i !== index);
          
        }
        );
    };

    const handleSubmit = (e : React.SubmitEvent) => {
        e.preventDefault();

        const cambios: CambiosTecnico = {
          ArchivosEliminados: [],
          ArchivosNuevos: [],
        };
        //para saber a que orden hacer los cambios.
        cambios.OrdenId = initialData.ordenId;
        cambios.UsuarioId = initialData.usuarioId || Number(usuario.UsuarioId) ;
        if (sot !== initialData.sot) cambios.Sot = sot;
        if (descripcion !== initialData.descripcion) cambios.Descripcion = descripcion;
        const ImagenesExistentes = new Set(
          imagenes.filter( (img) : img is ImagenExistente => (img.tipo == 'existente')).map( img => img.ArchivoId));
        cambios.ArchivosEliminados= initialData.imagenes.filter( img => !ImagenesExistentes.has(img.archivoId)).map(img => img.archivoId);
          
        //Archivos nuevos
        cambios.ArchivosNuevos = imagenes
        .filter((img): img is ImagenNueva => img.tipo === 'nueva')
        .map((img) => img.Archivo);
        //SUBIMOS LOS CAMBIOS

        onSubmit(initialData.ordenId,cambios);
    }




    return( 
      <form  onSubmit={handleSubmit} className="w-full space-y-5" method='POST'>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SOT Ingresar SOT</label>
          <input
            type="text"
            required
            value={sot}
            onChange={(e) => setSot(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del trabajo:</label>
            <textarea
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
            />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Insertar imágenes:</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImagenesChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
          />
        </div>
        
        {imagenes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {imagenes.map((img, index) => (
              <div key={index} className="relative w-20 h-20">
                <img
                  src={img.tipo === 'existente' ? `${BASE_URL}${img.Src}` : img.Preview}
                  alt={img.tipo === 'existente' ? "img ": img.Archivo.name}
                  className="w-full h-full object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => EliminarImagen(index)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 shadow-md hover:bg-red-700 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
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
            Guardar Cambios
          </button>
        </div>
      </form>
    )
}