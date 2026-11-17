import { useRef, useState } from 'react';
import type { Hoja } from '../../types/hoja.types';

interface Props {
    hojas: Hoja[];
    hojaActivaId?: number;
    onSeleccionar: (hojaId: number) => void;
    onRenombrar: (hojaId: number, nombre: string) => Promise<string | null>;   // null = salió bien
}

// Pestañas abajo de la hoja, como en Google Sheets / Excel.
// Clic = cambiar de hoja · doble clic = renombrar (Enter guarda, Esc cancela).
export const PestanasHojas = ({ hojas, hojaActivaId, onSeleccionar, onRenombrar }: Props) => {
    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [texto, setTexto] = useState('');
    const [error, setError] = useState<string | null>(null);

    const empezarEdicion = (hoja: Hoja) => {
        setEditandoId(hoja.hojaId);
        setTexto(hoja.nombre);
        setError(null);
    };

    const cancelar = () => {
        setEditandoId(null);
        setError(null);
    };

    // Enter guarda y al cerrarse el input también llega un blur: el ref evita guardar dos veces
    const guardando = useRef(false);

    const guardar = async (hoja: Hoja) => {
        if (guardando.current) return;
        const nombre = texto.trim();
        if (!nombre || nombre === hoja.nombre) return cancelar();   // vacío o sin cambios: no se llama al back
        guardando.current = true;
        const err = await onRenombrar(hoja.hojaId, nombre);
        guardando.current = false;
        if (err) setError(err);                                       // se queda editando para corregir
        else cancelar();
    };

    // las pestañas van de la más antigua a la más nueva (izquierda → derecha), como en Sheets
    const ordenadas = [...hojas].sort((a, b) => a.anio - b.anio || a.mes - b.mes);

    return (
        <div className="flex items-end gap-0.5 overflow-x-auto border-t border-gray-300 bg-gray-100 px-2">
            {ordenadas.map((hoja) => {
                const activa = hoja.hojaId === hojaActivaId;
                const editando = hoja.hojaId === editandoId;

                return (
                    <div
                        key={hoja.hojaId}
                        className={`flex shrink-0 items-center gap-2 rounded-b-md px-3 py-1.5 text-xs transition-colors ${
                            activa
                                ? 'border-x border-b border-gray-300 bg-white font-semibold text-emerald-700 shadow-sm'
                                : 'cursor-pointer text-gray-600 hover:bg-gray-200'
                        }`}
                        onClick={() => !editando && onSeleccionar(hoja.hojaId)}
                        onDoubleClick={() => empezarEdicion(hoja)}
                        title="Doble clic para renombrar"
                    >
                        {editando ? (
                            <input
                                autoFocus
                                value={texto}
                                maxLength={100}
                                onChange={(e) => setTexto(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') guardar(hoja);
                                    if (e.key === 'Escape') cancelar();
                                }}
                                onBlur={() => guardar(hoja)}
                                className="w-40 rounded border border-emerald-500 px-1 py-0.5 text-xs text-gray-800 outline-none"
                            />
                        ) : (
                            <span className="whitespace-nowrap">{hoja.nombre}</span>
                        )}
                        <span className="rounded-full bg-gray-200 px-1.5 text-[10px] font-medium text-gray-600">
                            {hoja.cantidadLiquidaciones}
                        </span>
                    </div>
                );
            })}

            {error && <span className="ml-3 self-center text-xs text-danger">{error}</span>}
        </div>
    );
};
