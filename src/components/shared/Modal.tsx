import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode; // Aquí adentro inyectaremos cualquier formulario
}

// Modal de formulario: tarjeta blanca de 24px sobre velo Ink
export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-card bg-surface shadow-menu"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-pill text-label transition-colors hover:bg-hover hover:text-ink"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </header>

        <div className="overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
