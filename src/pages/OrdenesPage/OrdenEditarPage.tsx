import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Images, Save } from 'lucide-react';
import { Card } from '../../components/Cards/Card';
import { Boton } from '../../components/ui/Controles';
import { EstadoMapeado } from '../../components/ui/StatusBadge';
import { CamposOrden } from '../../components/Ordenes/CamposOrden';
import { validarOrden, type ValoresOrden } from '../../components/Ordenes/validacionOrden';
import { ImagenesOrden } from '../../components/Ordenes/ImagenesOrden';
import { ModalData } from '../../components/shared/ModalData';
import { PictureVisor } from '../../components/shared/PictureVisor';
import { usePermisosOrden, useTecnicos } from '../../hooks/ordenes/useOrden';
import {
    agregarArchivos, edicionRapida, eliminarArchivo, mensajeError, obtenerOrdenPorSot, urlArchivo,
} from '../../services/Ordenes/OrdenesTrabajo.service';
import type { EdicionRapidaRequest, OrdenTrabajo } from '../../types/Ordenes';

const aValores = (o: OrdenTrabajo): ValoresOrden => ({
    sot: String(o.sot), docTecnico: o.docTecnico, trabajoRealizado: o.trabajoRealizado, estadoCampo: o.estadoCampo,
});

// Solo lo que cambió (el back ignora lo que llega en null)
const diferencias = (o: OrdenTrabajo, v: ValoresOrden): EdicionRapidaRequest => {
    const cambio: EdicionRapidaRequest = {};
    if (Number(v.sot) !== o.sot) cambio.sot = Number(v.sot);
    if (v.docTecnico.trim() !== o.docTecnico) cambio.docTecnico = v.docTecnico.trim();
    if (v.trabajoRealizado.trim() !== o.trabajoRealizado) cambio.trabajoRealizado = v.trabajoRealizado.trim();
    if (v.estadoCampo !== o.estadoCampo) cambio.estadoCampo = v.estadoCampo;
    return cambio;
};

export const OrdenEditarPage = () => {
    const navigate = useNavigate();
    const { sot } = useParams<{ sot: string }>();
    const desdeTabla = (useLocation().state as { orden?: OrdenTrabajo } | null)?.orden;
    const { puedeEditarCampos, puedeGestionarImagenes } = usePermisosOrden();
    const { tecnicos, nombreDe } = useTecnicos();

    const [orden, setOrden] = useState<OrdenTrabajo | null>(desdeTabla?.sot === Number(sot) ? desdeTabla : null);
    const [valores, setValores] = useState<ValoresOrden | null>(orden ? aValores(orden) : null);
    const [cargando, setCargando] = useState(!orden);
    const [guardando, setGuardando] = useState(false);
    const [subiendo, setSubiendo] = useState(false);
    const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
    const [visor, setVisor] = useState<number | null>(null);

    // se trae siempre la versión del servidor (la de la tabla puede estar desactualizada)
    useEffect(() => {
        let vigente = true;
        obtenerOrdenPorSot(Number(sot))
            .then((o) => {
                if (!vigente) return;
                setOrden(o);
                if (o) setValores(aValores(o));
            })
            .catch((err) => vigente && setAviso({ tipo: 'error', texto: mensajeError(err, 'No se pudo cargar la orden.') }))
            .finally(() => vigente && setCargando(false));
        return () => { vigente = false; };
    }, [sot]);

    if (cargando && !orden) return <p className="text-label">Cargando orden…</p>;
    if (!orden || !valores) {
        return (
            <div className="flex flex-col items-start gap-3">
                <p className="text-ink">{aviso?.texto ?? `No se encontró la SOT ${sot}.`}</p>
                <Boton variante="secundario" onClick={() => navigate('/ordenes')}>Volver al listado</Boton>
            </div>
        );
    }

    const cambio = diferencias(orden, valores);
    const hayCambios = Object.keys(cambio).length > 0;

    const guardar = async (e: React.FormEvent) => {
        e.preventDefault();
        const invalido = validarOrden(valores);
        if (invalido) return setAviso({ tipo: 'error', texto: invalido });
        try {
            setGuardando(true);
            setAviso(null);
            const actualizada = await edicionRapida(orden.ordenTrabajoId, cambio);
            setOrden(actualizada);
            setValores(aValores(actualizada));
            setAviso({ tipo: 'ok', texto: 'Cambios guardados.' });
            if (actualizada.sot !== orden.sot) navigate(`/ordenes/${actualizada.sot}/editar`, { replace: true, state: { orden: actualizada } });
        } catch (err) {
            setAviso({ tipo: 'error', texto: mensajeError(err, 'No se pudieron guardar los cambios.') });
        } finally {
            setGuardando(false);
        }
    };

    const subir = async (archivos: File[]) => {
        try {
            setSubiendo(true);
            setAviso(null);
            const lista = await agregarArchivos(orden.ordenTrabajoId, archivos);
            setOrden((o) => (o ? { ...o, archivos: lista } : o));
        } catch (err) {
            setAviso({ tipo: 'error', texto: mensajeError(err, 'No se pudieron subir las imágenes.') });
        } finally {
            setSubiendo(false);
        }
    };

    const quitar = async (archivoId: string | number) => {
        const archivo = orden.archivos.find((a) => a.archivoId === archivoId);
        if (!archivo || !window.confirm(`¿Eliminar la imagen "${archivo.nombreArchivo}"?`)) return;
        try {
            setSubiendo(true);
            await eliminarArchivo(orden.ordenTrabajoId, archivo.archivoId);
            setOrden((o) => (o ? { ...o, archivos: o.archivos.filter((a) => a.archivoId !== archivo.archivoId) } : o));
        } catch (err) {
            setAviso({ tipo: 'error', texto: mensajeError(err, 'No se pudo eliminar la imagen.') });
        } finally {
            setSubiendo(false);
        }
    };

    const nombre = nombreDe(orden.docTecnico);

    return (
        <form onSubmit={guardar} className="mx-auto flex max-w-5xl flex-col gap-5">
            <Card
                title={`SOT ${orden.sot}`}
                subtitle={nombre ? `Técnico: ${nombre}` : `Doc. técnico: ${orden.docTecnico || '—'}`}
                actions={<EstadoMapeado grupo="campo" valor={orden.estadoCampo} />}
            >
                <CamposOrden
                    valores={valores}
                    onCambio={(c) => setValores((v) => (v ? { ...v, ...c } : v))}
                    soloLectura={!puedeEditarCampos}
                    tecnicos={tecnicos}
                />
                {!puedeEditarCampos && (
                    <p className="mt-4 text-xs text-label">Tu rol solo puede gestionar las imágenes de la orden.</p>
                )}
            </Card>

            <Card
                title={`Imágenes (${orden.archivos.length})`}
                subtitle={puedeGestionarImagenes ? 'Los cambios en las imágenes se guardan al instante' : undefined}
            >
                <ImagenesOrden
                    imagenes={orden.archivos.map((a) => ({ clave: a.archivoId, src: urlArchivo(a), nombre: a.nombreArchivo }))}
                    onAgregar={puedeGestionarImagenes ? subir : undefined}
                    onEliminar={puedeGestionarImagenes ? quitar : undefined}
                    onAbrir={setVisor}
                    ocupado={subiendo}
                />
            </Card>

            {aviso && (
                <p className={`rounded-control border px-4 py-2.5 text-sm ${aviso.tipo === 'ok' ? 'border-success/30 bg-success-soft text-success' : 'border-danger/30 bg-danger-soft text-danger'}`}>
                    {aviso.texto}
                </p>
            )}

            <div className="flex justify-end gap-2">
                <Boton variante="secundario" onClick={() => navigate('/ordenes')}>Volver</Boton>
                {puedeEditarCampos && (
                    <Boton type="submit" icono={<Save size={16} strokeWidth={1.75} />} disabled={guardando || !hayCambios} className="min-w-32">
                        {guardando ? 'Guardando…' : 'Guardar cambios'}
                    </Boton>
                )}
            </div>

            <ModalData
                isOpen={visor !== null}
                onClose={() => setVisor(null)}
                tittle="Imágenes de la orden"
                subtitle={`SOT ${orden.sot}`}
                icon={<Images size={20} strokeWidth={1.75} />}
            >
                {visor !== null && <PictureVisor key={visor} imgs={orden.archivos} inicial={visor} />}
            </ModalData>
        </form>
    );
};
