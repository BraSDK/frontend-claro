import { Campo, Entrada, Selector, AreaTexto } from '../ui/Controles';
import { MAPEO_ESTADOS } from '../ui/StatusBadge';
import { MAX_TRABAJO_REALIZADO, type EstadoClaro } from '../../types/Ordenes';
import type { ValoresOrden } from './validacionOrden';
import type { TecnicoOpcion } from '../../hooks/ordenes/useOrden';

interface Props {
    valores: ValoresOrden;
    onCambio: (cambio: Partial<ValoresOrden>) => void;
    soloLectura?: boolean;
    docBloqueado?: boolean;              // el técnico registra a su nombre: su documento no se cambia
    tecnicos?: TecnicoOpcion[];          // si llega, se muestra el selector que completa el documento
}

// Campos de la orden de trabajo (CrearOrdenTrabajoRequest / EdicionRapidaRequest) en grilla de 4 columnas
export const CamposOrden = ({ valores, onCambio, soloLectura = false, docBloqueado = false, tecnicos }: Props) => {
    const tecnicoElegido = tecnicos?.some((t) => t.documento === valores.docTecnico.trim()) ? valores.docTecnico.trim() : '';

    return (
        <div className="grid grid-cols-1 items-start gap-x-[18px] gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            <Campo label="SOT" obligatorio>
                <Entrada
                    inputMode="numeric"
                    value={valores.sot}
                    onChange={(e) => onCambio({ sot: e.target.value.replace(/\D/g, '') })}
                    placeholder="Ej: 887123"
                    disabled={soloLectura}
                />
            </Campo>

            {tecnicos && !docBloqueado && (
                <Campo label="Técnico">
                    <Selector
                        value={tecnicoElegido}
                        onChange={(e) => onCambio({ docTecnico: e.target.value })}
                        disabled={soloLectura}
                    >
                        <option value="">Seleccione</option>
                        {tecnicos.map((t) => <option key={t.documento} value={t.documento}>{t.nombre}</option>)}
                    </Selector>
                </Campo>
            )}

            <Campo label="Doc. técnico" obligatorio>
                <Entrada
                    value={valores.docTecnico}
                    onChange={(e) => onCambio({ docTecnico: e.target.value })}
                    placeholder="Ej: 45879632"
                    disabled={soloLectura || docBloqueado}
                />
            </Campo>

            <Campo label="Estado en campo">
                <Selector
                    value={String(valores.estadoCampo)}
                    onChange={(e) => onCambio({ estadoCampo: Number(e.target.value) as EstadoClaro })}
                    disabled={soloLectura}
                >
                    {Object.entries(MAPEO_ESTADOS.campo).map(([valor, info]) => <option key={valor} value={valor}>{info.label}</option>)}
                </Selector>
            </Campo>

            <Campo label="Trabajo realizado" obligatorio className="sm:col-span-2 lg:col-span-4">
                <AreaTexto
                    value={valores.trabajoRealizado}
                    onChange={(e) => onCambio({ trabajoRealizado: e.target.value })}
                    maxLength={MAX_TRABAJO_REALIZADO}
                    placeholder="Ej: Instalación FTTH 1PLAY internet, 1 deco adicional"
                    disabled={soloLectura}
                />
                <span className="self-end text-xs text-label">{valores.trabajoRealizado.length}/{MAX_TRABAJO_REALIZADO}</span>
            </Campo>
        </div>
    );
};
