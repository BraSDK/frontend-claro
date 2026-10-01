import { useNavigate } from 'react-router-dom';
import { Hammer, ArrowRight } from 'lucide-react';

interface Props {
    titulo: string;
    descripcion: string;
    // acceso a lo que ya existe y cubre parte de esta sección
    atajo?: { texto: string; ruta: string };
}

// Página para las secciones del menú que todavía no están construidas
export const ProximamentePage = ({ titulo, descripcion, atajo }: Props) => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Hammer size={26} />
                </div>
                <p className="mt-4 text-base font-semibold text-slate-800">Sección en construcción</p>
                <p className="mt-1 max-w-md text-sm text-slate-500">{descripcion}</p>
                {atajo && (
                    <button
                        type="button"
                        onClick={() => navigate(atajo.ruta)}
                        className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                        {atajo.texto} <ArrowRight size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};
