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

// Panel lateral derecho: superficie blanca sobre velo, cabecera con título y cierre, pie opcional para acciones
export const Drawer = ({ isOpen, onClose, title, children, footer, widthClass = "w-96" }: DrawerProps) => {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink/30 transition-opacity duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}
        onClick={onClose}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full max-w-full ${widthClass} transform flex-col rounded-l-card bg-surface shadow-menu transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isOpen}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-pill text-label transition-colors hover:bg-hover hover:text-ink"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {footer && (
          <footer className="border-t border-line px-6 py-4">
            {footer}
          </footer>
        )}
      </aside>
    </>
  );
};
