import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Save } from 'lucide-react';
import { Card } from '../../components/Cards/Card';
import { Boton } from '../../components/ui/Controles';
import { CamposOrden } from '../../components/Ordenes/CamposOrden';
import { validarOrden, type ValoresOrden } from '../../components/Ordenes/validacionOrden';
import { ImagenesOrden } from '../../components/Ordenes/ImagenesOrden';
import { usePermisosOrden, useTecnicos } from '../../hooks/ordenes/useOrden';
import { usePerfil } from '../../hooks/usePerfil';
import { crearOrden, mensajeError } from '../../services/Ordenes/OrdenesTrabajo.service';
import { EstadoClaro } from '../../types/Ordenes';

interface Pendiente { clave: number; archivo: File; src: string }

export const OrdenesCrearPage = () => {
    const navigate = useNavigate();
    const { perfil } = usePerfil();
    const { esTecnico, puedeCrear } = usePermisosOrden();
    const { tecnicos } = useTecnicos(!esTecnico);

    const [valores, setValores] = useState<ValoresOrden>({ sot: '', docTecnico: '', trabajoRealizado: '', estadoCampo: EstadoClaro.COMPLETADO });
    const [imagenes, setImagenes] = useState<Pendiente[]>([]);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // el técnico registra a su nombre: su documento sale del perfil
    const vista: ValoresOrden = esTecnico ? { ...valores, docTecnico: perfil?.documentoIdentidad ?? '' } : valores;

    // las vistas previas se liberan al salir
    useEffect(() => () => imagenes.forEach((i) => URL.revokeObjectURL(i.src)), []); // eslint-disable-line react-hooks/exhaustive-deps

    const agregar = (archivos: File[]) =>
        setImagenes((prev) => [...prev, ...archivos.map((archivo, i) => ({ clave: Date.now() + i, archivo, src: URL.createObjectURL(archivo) }))]);

    const quitar = (clave: string | number) =>
        setImagenes((prev) => {
            const fuera = prev.find((i) => i.clave === clave);
            if (fuera) URL.revokeObjectURL(fuera.src);
            return prev.filter((i) => i.clave !== clave);
        });

    const items = useMemo(() => imagenes.map((i) => ({ clave: i.clave, src: i.src, nombre: i.archivo.name })), [imagenes]);

    const guardar = async (e: React.FormEvent) => {
        e.preventDefault();
        const invalido = validarOrden(vista);
        if (invalido) return setError(invalido);
        if (!perfil?.usuarioId) return setError('Tu cuenta no tiene un perfil de usuario asociado; no se puede registrar la orden.');

        try {
            setGuardando(true);
            setError(null);
            await crearOrden({
                sot: Number(vista.sot),
                docTecnico: vista.docTecnico.trim(),
                trabajoRealizado: vista.trabajoRealizado.trim(),
                estadoCampo: vista.estadoCampo,
                usuarioId: perfil.usuarioId,
                imagenes: imagenes.map((i) => i.archivo),
            });
            navigate('/ordenes', { replace: true });
        } catch (err) {
            setError(mensajeError(err, 'No se pudo registrar la orden.'));
        } finally {
            setGuardando(false);
        }
    };

    if (!puedeCrear) {
        return <p className="rounded-control border border-line bg-surface px-4 py-3 text-label">Tu rol no puede registrar órdenes de trabajo.</p>;
    }

    return (
        <form onSubmit={guardar} className="mx-auto flex max-w-5xl flex-col gap-5">
            <Card title="Datos de la orden" subtitle="Registro del trabajo realizado en campo">
                <CamposOrden
                    valores={vista}
                    onCambio={(c) => setValores((v) => ({ ...v, ...c }))}
                    docBloqueado={esTecnico}
                    tecnicos={esTecnico ? undefined : tecnicos}
                />
                {!esTecnico && (
                    <p className="mt-4 flex items-start gap-2 text-xs text-label">
                        <Info size={14} strokeWidth={1.75} className="mt-px shrink-0 text-info" />
                        El técnico se identifica por su documento. La orden queda asociada a tu usuario, porque el servicio aún no expone el Id de perfil de los técnicos.
                    </p>
                )}
            </Card>

            <Card title={`Imágenes (${imagenes.length})`} subtitle="Evidencias del trabajo: se suben al guardar">
                <ImagenesOrden imagenes={items} onAgregar={agregar} onEliminar={quitar} ocupado={guardando} />
            </Card>

            {error && <p className="rounded-control border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm text-danger">{error}</p>}

            <div className="flex justify-end gap-2">
                <Boton variante="secundario" onClick={() => navigate('/ordenes')} disabled={guardando}>Cancelar</Boton>
                <Boton type="submit" icono={<Save size={16} strokeWidth={1.75} />} disabled={guardando} className="min-w-32">
                    {guardando ? 'Guardando…' : 'Guardar orden'}
                </Boton>
            </div>
        </form>
    );
};
