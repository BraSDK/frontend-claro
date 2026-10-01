import { X , Save } from 'lucide-react';
import type { ReactNode } from "react";
interface ModalSmallProps {
  isOpen: boolean;
  onClose: () => void;
  formId?: string;
  submitLabel?: string;
  title: string;
  children?: ReactNode; // Aquí adentro inyectaremos cualquier formulario por ahora no lo usaremos
}

export const ModalSmall = ({isOpen,onClose,title,children,formId,submitLabel} : ModalSmallProps) => {
    if (!isOpen) return null;
    return(
            <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.16)] w-full max-w-md overflow-hidden flex flex-col border border-slate-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                    <h3 className="text-base font-semibold tracking-tight text-slate-900">
                        {title.toUpperCase()}
                    </h3>

                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 transition-all p-1.5 rounded-lg hover:bg-slate-100"
                    >
                        <X size={19} />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6 bg-white">
                    {children}
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60">

                    <button
                        onClick={onClose}
                        className="
                            text-sm font-medium
                            text-slate-600
                            px-4 py-2.5
                            rounded-lg
                            border border-slate-200
                            bg-white
                            hover:bg-slate-50
                            hover:border-slate-300
                            transition-all
                        "
                    >
                        Cancelar
                    </button>

                    {formId && (
                    <button
                        type="submit"
                        form={formId}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        {submitLabel}
                    </button>
                    )}

                </div>

            </div>
        )
       

};