import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Images, Plus, RefreshCw } from 'lucide-react';
import { FilterBar } from '../../components/ui/FilterBar';
import { Campo, Entrada, RangoFechas, Boton } from '../../components/ui/Controles';
import { DataTable, AccionTabla } from '../../components/ui/DataTable';
import { OrdenesTable } from '../../components/Ordenes/OrdenesTable';
import { BarPaginancion } from '../../components/Paginacion/BarPaginacion';
import { ModalData } from '../../components/shared/ModalData';
import { PictureVisor } from '../../components/shared/PictureVisor';
import { useOrdenes, usePermisosOrden, useTecnicos } from '../../hooks/ordenes/useOrden';
import { eliminarOrden, mensajeError } from '../../services/Ordenes/OrdenesTrabajo.service';
import type { OrdenTrabajo } from '../../types/Ordenes';

const TAMANO_PAGINA = 15;

export const OrdenesPage = () => {

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { puedeCrear } = usePermisosOrden();
    const { nombreDe , tecnicos} = useTecnicos();

    // ===== Filtros: lo que escribe el usuario y lo que se aplicó con "Buscar" =====
    const inicial = searchParams.get('buscar') ?? '';
    const [sot, setSot] = useState(inicial);
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const [aplicados, setAplicados] = useState({ buscar: inicial, desde: '', hasta: '' });
    const [pagina, setPagina] = useState(1);

    // búsqueda desde la barra superior (?buscar=): cuando cambia la URL se aplica como filtro
    const buscarUrl = searchParams.get('buscar');
    const [buscarUrlPrevio, setBuscarUrlPrevio] = useState(buscarUrl);
    if (buscarUrl !== buscarUrlPrevio) {
        setBuscarUrlPrevio(buscarUrl);
        if (buscarUrl !== null) {
            setSot(buscarUrl);
            setAplicados((a) => ({ ...a, buscar: buscarUrl }));
            setPagina(1);
        }
    }

    const { ordenes, pagina: datos, cargando, error, recargar } = useOrdenes({
        pagina,
        canPagina: TAMANO_PAGINA,
        buscar: aplicados.buscar.trim() || undefined,
        desde: aplicados.desde || undefined,
        hasta: aplicados.hasta || undefined,
    });


    const buscar = () => {
        setAplicados({ buscar: sot, desde, hasta });
        setPagina(1);
    };

    const limpiar = () => {
        setSot(''); setDesde(''); setHasta('');
        setAplicados({ buscar: '', desde: '', hasta: '' });
        setPagina(1);
        if (searchParams.has('buscar')) setSearchParams({});
    };

    const hayFiltros = !!(sot || desde || hasta || aplicados.buscar || aplicados.desde || aplicados.hasta);

    // ===== Acciones de fila =====
    const [visor, setVisor] = useState<OrdenTrabajo | null>(null);
    const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

    const eliminar = async (orden: OrdenTrabajo) => {
        if (!window.confirm(`¿Eliminar la SOT ${orden.sot} y sus imágenes? Esta acción no se puede deshacer.`)) return;
        try {
            await eliminarOrden(orden.ordenTrabajoId);
            setAviso({ tipo: 'ok', texto: `SOT ${orden.sot} eliminada.` });
            // si era la última fila de la página, se retrocede una
            if (ordenes.length === 1 && pagina > 1) setPagina(pagina - 1); else recargar();
        } catch (err) {
            setAviso({ tipo: 'error', texto: mensajeError(err, 'No se pudo eliminar la orden.') });
        }
    }
    return (
        <div className="flex flex-col gap-5">
            <FilterBar onBuscar={buscar} onLimpiar={limpiar} hayFiltros={hayFiltros}>
                <Campo label="SOT">
                    <Entrada
                        inputMode="numeric"
                        value={sot}
                        onChange={(e) => setSot(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ej: 887123"
                    />
                </Campo>
                <Campo label="Fecha de registro">
                    <RangoFechas desde={desde} hasta={hasta} onDesde={setDesde} onHasta={setHasta} />
                </Campo>
            </FilterBar>

            {(aviso || error) && (
                <p className={`rounded-control border px-4 py-2.5 text-sm ${aviso?.tipo === 'ok' ? 'border-success/30 bg-success-soft text-success' : 'border-danger/30 bg-danger-soft text-danger'}`}>
                    {aviso?.texto ?? error}
                </p>
            )}

            <DataTable
                titulo="Listado de órdenes de trabajo"
                cantidad={datos?.totalRegistros ?? 0}
                acciones={
                    <>
                        <AccionTabla icono={<RefreshCw size={16} strokeWidth={1.75} />} onClick={recargar} disabled={cargando}>
                            Actualizar
                        </AccionTabla>
                        {puedeCrear && (
                            <Boton icono={<Plus size={16} strokeWidth={1.75} />} onClick={() => navigate('/ordenes/nueva')}>
                                Nueva orden
                            </Boton>
                        )}
                    </>
                }
                pie={
                    <BarPaginancion
                        onHandle={setPagina}
                        numeroPagina={datos?.numeroPagina ?? pagina}
                        totalRegistros={datos?.totalRegistros ?? 0}
                        totalRegistrosPagina={datos?.totalRegistrosPagina ?? 0}
                        totalPaginasTotales={datos?.totalPaginasTotales ?? 1}
                    />
                }
            >
                <OrdenesTable
                    ordenes={ordenes}
                    cargando={cargando}
                    nombreTecnico={nombreDe}
                    onVerImagenes={setVisor}
                    onEliminar={eliminar}
                />
            </DataTable>

            <ModalData
                isOpen={visor !== null}
                onClose={() => setVisor(null)}
                tittle="Imágenes de la orden"
                subtitle={visor ? `SOT ${visor.sot}` : undefined}
                icon={<Images size={20} strokeWidth={1.75} />}
            >
                {visor && <PictureVisor imgs={visor.archivos} />}
            </ModalData>
        </div>
    );
};
