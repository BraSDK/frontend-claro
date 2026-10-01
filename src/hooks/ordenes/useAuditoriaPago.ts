import { useState } from 'react';
import { auditarPago } from '../../services/Ordenes/OrdenesTrabajo.service';
import type { AuditoriaPagoRequest, AuditoriaPagoResponse } from '../../types/Ordenes';

// Guarda el "Sí pago / No pago" de una SOT y expone el estado de la petición
export const useAuditoriaPago = () => {
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const guardarEstadoPago = async (ordenId: number, request: AuditoriaPagoRequest): Promise<AuditoriaPagoResponse | null> => {
        try {
            setGuardando(true);
            setError(null);
            return await auditarPago(ordenId, request);
        } catch (err: any) {
            setError(
                err.response?.status === 403
                    ? 'No tienes permisos para auditar.'
                    : err.response?.data?.message ?? 'No se pudo guardar el estado de pago.'
            );
            return null;
        } finally {
            setGuardando(false);
        }
    };

    return { guardarEstadoPago, guardando, error, limpiarError: () => setError(null) };
};
