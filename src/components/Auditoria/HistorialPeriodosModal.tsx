import { etiquetaPago, type FilaAuditoria } from '@/types/auditoria.types';

interface Props {
    fila: FilaAuditoria | null;
    onCerrar: () => void;
}

const formatearMes = (mes?: string | null) => {
    if (!mes) return '';
    return mes.length === 6 ? `${mes.slice(0, 4)}-${mes.slice(4)}` : mes;
};

export const HistorialPeriodosModal = ({ fila, onCerrar }: Props) => {
    if (!fila) return null;

    const historial = fila.historialPeriodos ?? [];
    const periodoActual = [formatearMes(fila.mesPago), fila.semanaPago].filter(Boolean).join(' · ');

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onCerrar}
        >
            <div
                className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between border-b pb-3">
                    <div>
                        <h3 className="text-base font-semibold text-ink">
                            Recorrido de pagos · SOT {fila.sot}
                        </h3>
                        <p className="text-xs text-muted">
                            {fila.tecnico || 'Sin técnico asignado'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                <div className="relative ml-3 flex max-h-[60vh] flex-col gap-5 overflow-y-auto border-l-2 border-gray-200 py-2 pl-5">
                    {/* 1. Intentos anteriores guardados en el array */}
                    {historial.map((raw, idx) => {
                        const [mes = '', sem = '', est = '0', monto = '0', obs = ''] = raw.split('|');
                        const periodo = [formatearMes(mes), sem].filter(Boolean).join(' · ');

                        return (
                            <div key={idx} className="relative">
                                <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-danger ring-4 ring-white" />
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-semibold text-ink">
                                        {periodo}
                                    </span>
                                    <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-medium text-danger">
                                        {etiquetaPago(Number(est))}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-muted">
                                    Pagado: S/ {Number(monto).toFixed(2)}
                                </p>
                                {obs && (
                                    <p className="mt-1 rounded border border-gray-100 bg-gray-50 px-2 py-1 text-xs text-danger">
                                        Motivo: {obs}
                                    </p>
                                )}
                            </div>
                        );
                    })}

                    {/* 2. Estado vigente en la grilla */}
                    <div className="relative">
                        <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-success ring-4 ring-white" />
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-ink">
                                {periodoActual} (Actual)
                            </span>
                            <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                                {fila.estado}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-muted">
                            Pagado: S/ {Number(fila.montoPagado ?? 0).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};