import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Boton } from "../ui/Controles";

interface ModalDataProps {
    isOpen: boolean;
    onClose: () => void;
    children?: ReactNode;
    tittle: string;
    subtitle?: string;
    icon?: ReactNode;
}

// Modal de consulta (solo lectura): cabecera con título, contenido y botón Cerrar. Esc también cierra.
export const ModalData = ({ isOpen, onClose, children, tittle, icon, subtitle }: ModalDataProps) => {
    useEffect(() => {
        if (!isOpen) return;
        const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", tecla);
        return () => document.removeEventListener("keydown", tecla);
    }, [isOpen, onClose]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-card bg-surface shadow-menu"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between gap-3 border-b border-line-soft px-6 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        {icon && <span className="text-ink">{icon}</span>}
                        <div className="min-w-0">
                            <h2 className="truncate text-[17px] font-bold text-ink">{tittle}</h2>
                            {subtitle && <p className="text-sm text-label">{subtitle}</p>}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="flex h-8 w-8 items-center justify-center rounded-control text-ink transition-colors hover:bg-hover"
                    >
                        <X size={18} strokeWidth={1.75} />
                    </button>
                </header>

                <div className="overflow-y-auto px-6 py-5">{children}</div>

                <footer className="flex justify-end border-t border-line-soft px-6 py-3">
                    <Boton variante="secundario" onClick={onClose}>Cerrar</Boton>
                </footer>
            </div>
        </div>
    );
};
