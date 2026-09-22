import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode; // Aquí adentro inyectaremos cualquier formulario
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    // Fondo oscuro desenfocado (Backdrop)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* Contenedor del Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo (Aquí entra el formulario) */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};