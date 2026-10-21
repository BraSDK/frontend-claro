import type { ReactNode } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode; // Permite inyectar botones dinámicos
  widthClass?: string; // Permite cambiar el ancho (ej: 'w-96' para filtros, 'w-[600px]' para formularios)
}

export const Drawer = ({ isOpen, onClose, title, children, footer, widthClass = "w-96" }: DrawerProps) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      ></div>

      <div 
        className={`fixed top-0 right-0 h-full ${widthClass} max-w-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>

        {/* Solo renderiza el footer si se envía como prop */}
        {footer && (
          <div className="p-5 border-t border-gray-200 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};