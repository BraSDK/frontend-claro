import React from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Drawer = ({ isOpen, onClose, title, children }: DrawerProps) => {
  return (
    <>
      {/* Fondo oscuro (Overlay) */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      ></div>

      {/* Panel lateral que entra por la derecha */}
      <div 
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cabecera del Drawer */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Contenido (Los filtros irán aquí) */}
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>

        {/* Pie del Drawer (Botones de aplicar/limpiar) */}
        <div className="p-5 border-t border-gray-200 bg-gray-50">
          <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium transition-colors">
            Aplicar Filtros
          </button>
        </div>
      </div>
    </>
  );
};