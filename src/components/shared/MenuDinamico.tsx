import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

interface MenuDinamicoProps{
    opciones : OpcionMenu[];
    icono?: ReactNode;      // ícono del botón que abre el menú (por defecto: tres puntos)
    title?: string;         // tooltip del botón
}

export interface OpcionMenu {
    label: string;
    accion: () => void;
    icono?: ReactNode;
    opcionAdviser?: boolean;   // true = opción peligrosa (se pinta en rojo)
}

const ALTO_OPCION = 40;   // alto aproximado de cada opción, para decidir si abre hacia arriba
const SEPARACION = 8;     // espacio entre el botón y el menú

export const MenuDinamico = ({opciones, icono, title = "Más opciones"}:MenuDinamicoProps) => {
    // 1. El estado de abierto vive aquí dentro: cada fila tiene su propio menú
    //    y ya no hace falta guardar "qué fila está abierta" en la tabla.
    const [abierto, setAbierto] = useState(false);
    const [posicion, setPosicion] = useState<CSSProperties>({});
    const botonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // 2. Calcula dónde dibujar el menú a partir de la posición real del botón en la pantalla.
    //    Si no cabe debajo, lo abre hacia arriba.
    const abrir = () => {
        const rect = botonRef.current?.getBoundingClientRect();
        if (!rect) return;
        const altoMenu = opciones.length * ALTO_OPCION + SEPARACION;
        const cabeAbajo = rect.bottom + SEPARACION + altoMenu <= window.innerHeight;

        setPosicion({
            right: window.innerWidth - rect.right,
            ...(cabeAbajo
                ? { top: rect.bottom + SEPARACION }
                : { bottom: window.innerHeight - rect.top + SEPARACION }),
        });
        setAbierto(true);
    };

    const cerrar = () => setAbierto(false);

    // 3. Mientras está abierto: se cierra al hacer click fuera, con Escape,
    //    o si la página hace scroll / cambia de tamaño (el menú quedaría desfasado del botón).
    useEffect(() => {
        if (!abierto) return;

        const clickFuera = (e: MouseEvent) => {
            const objetivo = e.target as Node;
            if (menuRef.current?.contains(objetivo) || botonRef.current?.contains(objetivo)) return;
            cerrar();
        };
        const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") cerrar(); };

        document.addEventListener("mousedown", clickFuera);
        document.addEventListener("keydown", tecla);
        window.addEventListener("scroll", cerrar, true);   // true = también scroll de contenedores internos
        window.addEventListener("resize", cerrar);
        return () => {
            document.removeEventListener("mousedown", clickFuera);
            document.removeEventListener("keydown", tecla);
            window.removeEventListener("scroll", cerrar, true);
            window.removeEventListener("resize", cerrar);
        };
    }, [abierto]);

    return(
        <>
            <button
                ref={botonRef}
                type="button"
                title={title}
                onClick={() => (abierto ? cerrar() : abrir())}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-hover hover:text-ink ${abierto ? "bg-hover text-ink" : "text-label"}`}
            >
                {icono ?? <MoreVertical size={18} strokeWidth={1.75} />}
            </button>

            {/* 4. createPortal dibuja el menú directamente en <body>, fuera de la tabla.
                   Por eso ningún overflow-hidden / overflow-x-auto de la tabla o la tarjeta lo corta.
                   Usa position: fixed con las coordenadas calculadas en el paso 2. */}
            {abierto && createPortal(
                <div
                    ref={menuRef}
                    style={posicion}
                    className="fixed z-50 w-52 overflow-hidden rounded-card border border-line bg-surface p-1.5 text-left shadow-menu"
                >
                    {opciones.map((opcion, index) => (
                        <button
                            key={`${opcion.label}-${index}`}   // 5. key única aunque dos opciones tengan el mismo texto
                            type="button"
                            // 6. Ejecuta la acción y cierra el menú
                            onClick={() => { opcion.accion(); cerrar(); }}
                            className={`flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-sm transition-colors ${
                                opcion.opcionAdviser
                                    ? "text-danger hover:bg-danger-soft"
                                    : "text-ink hover:bg-hover"
                            }`}
                        >
                            {opcion.icono}
                            {opcion.label}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
};
