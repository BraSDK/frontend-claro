import { X } from 'lucide-react';
import type { ReactNode } from "react";
import { Boton } from '../ui/Controles';

interface ModalSmallProps {
  isOpen: boolean;
  onClose: () => void;
  formId?: string;
  submitLabel?: string;
  title: string;
  children?: ReactNode;
}

// Tarjeta de formulario corto con Cancelar / Enviar en el pie (el formulario se asocia por formId)
export const ModalSmall = ({ isOpen, onClose, title, children, formId, submitLabel }: ModalSmallProps) => {
    if (!isOpen) return null;
    return (
        <div className="flex w-full max-w-md flex-col overflow-hidden rounded-card bg-surface shadow-menu">
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

            <div className="p-6">{children}</div>

            <footer className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">
                <Boton variante="secundario" onClick={onClose}>Cancelar</Boton>
                {formId && <Boton type="submit" form={formId}>{submitLabel}</Boton>}
            </footer>
        </div>
    );
};
