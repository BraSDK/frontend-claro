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
            <h1 className="text-2xl font-bold text-ink">{titulo}</h1>
            <div className="flex flex-col items-center rounded-card border border-dashed border-line bg-surface px-6 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-pill bg-primary-soft text-primary">
                    <Hammer size={26} />
                </div>
                <p className="mt-4 text-base font-semibold text-ink">Sección en construcción</p>
                <p className="mt-1 max-w-md text-sm text-label">{descripcion}</p>
                {atajo && (
                    <button
                        type="button"
                        onClick={() => navigate(atajo.ruta)}
                        className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-pill bg-brand px-5 text-sm font-semibold text-on-primary transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {atajo.texto} <ArrowRight size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};
