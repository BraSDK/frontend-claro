import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Opcion = { valor: string; etiqueta: string };

interface Props {
    tipo: "texto" | "monto" | "select";
    valor: string;                          // valor actual (para monto, el número como texto)
    opciones?: Opcion[];                    // solo para tipo "select"
    mostrar?: ReactNode;                    // cómo se ve sin editar (por defecto, el valor)
    alinear?: "izquierda" | "centro" | "derecha";
    maxLength?: number;                     // solo para tipo "texto"
    deshabilitada?: boolean;
    onGuardar: (nuevo: string) => Promise<void>;   // si lanza error, la celda vuelve al valor anterior
}

// Celda de tabla que se edita en el lugar: click o Enter para editar, Enter o salir de la celda para guardar, Esc para cancelar
export const CeldaEditable = ({ tipo, valor, opciones = [], mostrar, alinear = "izquierda", maxLength = 500, deshabilitada = false, onGuardar }: Props) => {
    const [editando, setEditando] = useState(false);
    const [borrador, setBorrador] = useState(valor);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const campoRef = useRef<HTMLInputElement & HTMLSelectElement>(null);
    const cancelado = useRef(false);
    const enEdicion = useRef(false);   // evita guardar dos veces (p. ej. elegir en el select y luego perder el foco)

    useEffect(() => { if (!editando) setBorrador(valor); }, [valor, editando]);
    useEffect(() => { if (editando) campoRef.current?.focus(); }, [editando]);

    const empezar = () => {
        if (deshabilitada || guardando) return;
        cancelado.current = false;
        enEdicion.current = true;
        setError(null);
        setBorrador(valor);
        setEditando(true);
    };

    const terminar = async (nuevo = borrador) => {
        if (!enEdicion.current) return;
        enEdicion.current = false;
        setEditando(false);
        if (cancelado.current) return;
        const limpio = tipo === "texto" ? nuevo.trim() : nuevo;
        if (limpio === valor) return;   // sin cambios: no se llama al back
        if (tipo === "monto" && (limpio === "" || Number.isNaN(Number(limpio)) || Number(limpio) < 0)) {
            setError("Monto inválido");
            return;
        }
        try {
            setGuardando(true);
            setError(null);
            await onGuardar(limpio);
        } catch (err: any) {
            setError(err?.response?.data?.error ?? "No se pudo guardar");
        } finally {
            setGuardando(false);
        }
    };

    const teclas = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") { e.preventDefault(); campoRef.current?.blur(); }
        if (e.key === "Escape") { cancelado.current = true; setBorrador(valor); campoRef.current?.blur(); }
    };

    const claseCampo = `h-8 w-full rounded-control border border-transparent bg-surface px-2 text-sm text-ink outline-none ring-2 ring-primary ${alinear === "derecha" ? "text-right" : alinear === "centro" ? "text-center" : ""}`;

    if (editando) {
        return tipo === "select" ? (
            <select
                ref={campoRef}
                value={borrador}
                onChange={(e) => { setBorrador(e.target.value); terminar(e.target.value); }}   // en un select, elegir ya es confirmar
                onBlur={() => terminar()}
                onKeyDown={teclas}
                className={claseCampo}
            >
                {opciones.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
            </select>
        ) : (
            <input
                ref={campoRef}
                type={tipo === "monto" ? "number" : "text"}
                inputMode={tipo === "monto" ? "decimal" : undefined}
                step={tipo === "monto" ? "0.01" : undefined}
                min={tipo === "monto" ? 0 : undefined}
                maxLength={tipo === "texto" ? maxLength : undefined}
                value={borrador}
                onChange={(e) => setBorrador(e.target.value)}
                onBlur={() => terminar()}
                onKeyDown={teclas}
                className={claseCampo}
            />
        );
    }

    return (
        <div
            role={deshabilitada ? undefined : "button"}
            tabIndex={deshabilitada ? undefined : 0}
            onClick={empezar}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === "F2") { e.preventDefault(); empezar(); } }}
            title={error ?? (deshabilitada ? undefined : "Click para editar")}
            className={`flex min-h-8 items-center gap-1.5 rounded-control px-2 py-0.5 transition-colors ${
                alinear === "derecha" ? "justify-end" : alinear === "centro" ? "justify-center" : ""
            } ${deshabilitada ? "" : "cursor-text hover:bg-page focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"} ${
                error ? "ring-1 ring-inset ring-danger bg-danger-soft" : ""
            }`}
        >
            {guardando && <Loader2 size={13} className="shrink-0 animate-spin text-info" />}
            <span className="min-w-0 truncate">{mostrar ?? (valor || "-")}</span>
        </div>
    );
};
