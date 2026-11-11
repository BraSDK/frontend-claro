import { useEffect, useState } from 'react';
import { Modal } from '../shared/Modal';
import { Campo, Entrada } from '../shared/Filtros';
import { AccionTabla, Boton } from '../shared/Tabla';
import { CONCEPTOS_ADICIONALES } from '../../utils/liquidacion.mapper';
import { actualizarAdicional, crearAdicional } from '../../services/liquidacion.service';
import type { AdicionalDto } from '../../types/liquidacion.types';
import { useServicios } from '@/hooks/servicio/useServicios';

interface Props {
    abierto: boolean;
    onCerrar: () => void;
    catalogo: AdicionalDto[];
    puedeEditar: boolean;          // solo ADMIN cambia precios
    onGuardado: () => void;        // recargar catálogo y liquidaciones
}

// Precio unitario de cada adicional de la grilla. Si el concepto no existe en el catálogo, se crea al guardar.
export const PreciosAdicionalesModal = ({ abierto, onCerrar, catalogo, puedeEditar, onGuardado }: Props) => {
    const [precios, setPrecios] = useState<Record<string, string>>({});
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [codigos, setCodigos] = useState<Record<string, number>>({});
    const { servicios } = useServicios();
    const buscar = (concepto: string) => catalogo.find((a) => a.nombre.trim().toUpperCase() === concepto);

    // al abrir, se cargan los precios actuales
    useEffect(() => {
        if (!abierto) return;
        setError(null);
        setPrecios(Object.fromEntries(CONCEPTOS_ADICIONALES.map((c) => [c.concepto, buscar(c.concepto)?.precio?.toString() ?? ''])));
        setCodigos(Object.fromEntries(CONCEPTOS_ADICIONALES.map((c) => [c.concepto,Number(buscar(c.concepto)?.codigo)])));
    }, [abierto, catalogo]);

    const guardar = async () => {
        setGuardando(true); setError(null);
        try {
            for (const c of CONCEPTOS_ADICIONALES) {
                const texto = precios[c.concepto]?.trim() ?? '';
                if (texto === '') continue;
                const precio = Number(texto.replace(',', '.'));
                if (!Number.isFinite(precio) || precio < 0) throw new Error(`Precio no válido para ${c.concepto}`);
                const codigo = codigos[c.concepto];
                const actual = buscar(c.concepto);
                const datos = { nombre: c.concepto, codigo, tipo: c.tipoCatalogo ?? 0 , columnaExcel: String(c.campo) };
                if (!actual) await crearAdicional(datos);
                else{await actualizarAdicional(actual.adicionalId, datos);} 
            }
            onGuardado();
            onCerrar();
        } catch (e: any) {
            setError(e.response?.data?.error ?? e.message ?? 'No se pudieron guardar los precios');
        } finally {
            setGuardando(false);
        }
    };



    return (
        <Modal isOpen={abierto} onClose={onCerrar} title="Precios de adicionales">
            <div className="flex flex-col gap-4">
                <p className="text-sm text-muted">
                    El total de cada SOT es el costo de servicio más la cantidad de cada adicional por su precio.
                    Un precio nuevo se aplica a las liquidaciones que se creen o editen desde ahora.
                </p>

                <div className="grid grid-cols-2 gap-3">
                    {CONCEPTOS_ADICIONALES.map((c) => (
                        <>                   
                            <Campo key={c.concepto} label="codigo del servicio">
                                <Entrada
                                    inputMode="text"
                                    value={codigos[c.concepto] ?? ""}
                                    disabled={!puedeEditar}
                                    placeholder="inserte codigo servicio"
                                    onChange={(e) => {
                                        const codigoAsignado =  Number(e.target.value);
                                        setCodigos((p) => ({ ...p, [c.concepto]: Number(e.target.value)}));
                                        const precio_nuevo = servicios.find( s => s.codigo == codigoAsignado)?.precio;
                                        setPrecios((p) => ({ ...p, [c.concepto]: String(precio_nuevo ?? "") }))
                                    }}
                                />
                            </Campo>
                            <Campo key={c.concepto} label={`${c.concepto} (S/ por unidad)`}>
                                <Entrada
                                    inputMode="decimal"
                                    value={precios[c.concepto] ?? ''}
                                    disabled={false}
                                    placeholder="Sin precio"
                                    onChange={(e) => setPrecios((p) => ({ ...p, [c.concepto]: e.target.value }))}
                                />
                            </Campo>
                        </>
                    ))}
                </div>

                {error && <div className="rounded-control bg-danger-soft px-4 py-2 text-sm text-danger">{error}</div>}

                <div className="flex justify-end gap-2">
                    <AccionTabla onClick={onCerrar}>{puedeEditar ? 'Cancelar' : 'Cerrar'}</AccionTabla>
                    {puedeEditar && <Boton onClick={guardar} disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar precios'}</Boton>}
                </div>
            </div>
        </Modal>
    );
};
