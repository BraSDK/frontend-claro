import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode; // Permite inyectar botones dinámicos
  widthClass?: string; // Permite cambiar el ancho (ej: 'w-96' para filtros, 'w-[600px]' para formularios)
}

// Panel lateral derecho: cabecera con título en negrita y cierre, contenido con scroll y pie opcional
export const Drawer = ({ isOpen, onClose, title, children, footer, widthClass = "w-96" }: DrawerProps) => {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}
        onClick={onClose}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full max-w-full ${widthClass} transform flex-col bg-surface shadow-menu transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isOpen}
      >
        <header className="flex items-center justify-between border-b border-line-soft px-6 py-3">
          <h2 className="text-[17px] font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-control text-ink transition-colors hover:bg-hover"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {footer && (
          <footer className="border-t border-line-soft bg-filters px-6 py-3">
            {footer}
          </footer>
        )}
      </aside>
    </>
  );
};
