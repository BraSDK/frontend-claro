import { X } from "lucide-react";
import type { ReactNode } from "react";
interface ModalDataProps{
    isOpen: boolean;
    onClose: () => void;
    children? : ReactNode;
    componente2? : ReactNode;
    tittle : string;
    subtitle? : string;
    icon?: ReactNode;

}
export const ModalData = ({isOpen,onClose,children,componente2,tittle,icon,subtitle}:ModalDataProps) => {
    
    if (!isOpen) return null;
    return(
        
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-xl">

                {/* Encabezado */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-4">
                        
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            {icon}
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900">
                                {tittle} 
                            </h1>
                            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}

                        </div>

                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Contenido */}
                <div className="px-6 py-5">
                    <div className="py-3">
                        {children}
                        {componente2}
                    </div>
                </div>

                {/* Pie */}
                <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>

            </div>
        </div>

    )
};