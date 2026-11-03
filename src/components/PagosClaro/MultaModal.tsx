import { useEffect, useState } from 'react';
import { Modal } from '../shared/Modal';
import { Campo, Entrada } from '../shared/Filtros';
import { AccionTabla, Boton } from '../shared/Tabla';
import { crearMultaClaro, editarMultaClaro, mensajeError } from '../../services/pagosClaro.service';
import type { MultaClaro } from '../../types/pagosClaro.types';

interface Props {
    abierto: boolean;
    multa: MultaClaro | null;   // null = nueva
    onCerrar: () => void;
    onGuardado: () => void;
}

const hoy = () => new Date().toLocaleDateString('en-CA');

// Multa general de Claro (no va ligada a una SOT)
export const MultaModal = ({ abierto, multa, onCerrar, onGuardado }: Props) => {
    const [fecha, setFecha] = useState(hoy());
    const [motivo, setMotivo] = useState('');
    const [monto, setMonto] = useState('');
    const [tecnico, setTecnico] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!abierto) return;
        setError(null);
        setFecha(multa?.fecha.slice(0, 10) ?? hoy());
        setMotivo(multa?.motivo ?? '');
        setMonto(multa ? String(multa.monto) : '');
        setTecnico(multa?.nombreTecnico ?? '');
    }, [abierto, multa]);

    const guardar = async (e: React.FormEvent) => {
        e.preventDefault();
        const valor = Number(monto.replace(',', '.'));
        if (!motivo.trim()) { setError('Escribe el motivo'); return; }
        if (!Number.isFinite(valor) || valor <= 0) { setError('El monto debe ser mayor a 0'); return; }
        setGuardando(true); setError(null);
        try {
            const datos = { fecha, motivo: motivo.trim(), monto: valor, nombreTecnico: tecnico.trim() || undefined };
            if (multa) await editarMultaClaro(multa.multaClaroId, datos);
            else await crearMultaClaro(datos);
            onGuardado();
            onCerrar();
        } catch (err) {
            setError(mensajeError(err, 'No se pudo guardar la multa'));
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal isOpen={abierto} onClose={onCerrar} title={multa ? 'Editar multa' : 'Nueva multa'}>
            <form onSubmit={guardar} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                    <Campo label="Fecha" obligatorio>
                        <Entrada type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                    </Campo>
                    <Campo label="Monto (S/)" obligatorio>
                        <Entrada inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" />
                    </Campo>
                    <Campo label="Motivo" obligatorio className="col-span-2">
                        <Entrada value={motivo} maxLength={200} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej: Penalidad por reiterativas" />
                    </Campo>
                    <Campo label="Técnico" className="col-span-2">
                        <Entrada value={tecnico} maxLength={150} onChange={(e) => setTecnico(e.target.value)} placeholder="Opcional" />
                    </Campo>
                </div>
                {multa?.pagoClaroId && (
                    <p className="rounded-md bg-warning-soft px-3 py-2 text-sm text-warning">
                        Esta multa ya está descontada en el pago {multa.comprobantePago}: cambiar el monto cambia el neto de ese pago.
                    </p>
                )}
                {error && <div className="rounded-control bg-danger-soft px-4 py-2 text-sm text-danger">{error}</div>}
                <div className="flex justify-end gap-2">
                    <AccionTabla onClick={onCerrar}>Cancelar</AccionTabla>
                    <Boton type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</Boton>
                </div>
            </form>
        </Modal>
    );
};
