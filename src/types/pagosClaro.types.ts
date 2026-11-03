// Igual que los DTOs de backend-claro (Application/DTOs/PagosClaro)

export interface RangoFechas {
    desde?: string;   // 'YYYY-MM-DD'
    hasta?: string;   // inclusive
}

// SOT auditada (Pagó / Incompleto / No pagó) que entra en un pago de Claro
export interface SotPago {
    sot: number;
    nombreTecnico: string;
    fechaProgramacion: string;
    totalACobrar: number;
    montoPagado: number;
    estadoPago: number;            // EstadoPago: 1 Pagó, 2 No pagó, 3 Incompleto
    fechaValidacion?: string | null;
}

export interface MultaClaro {
    multaClaroId: number;
    fecha: string;
    motivo: string;
    monto: number;
    nombreTecnico?: string | null;
    pagoClaroId?: number | null;   // null = pendiente de descontar
    comprobantePago?: string | null;
}

export interface GuardarMulta {
    fecha: string;
    motivo: string;
    monto: number;
    nombreTecnico?: string;
}

export interface CrearPagoClaro {
    fechaPago: string;
    comprobante: string;
    observacion?: string;
    sots: number[];
    multaIds: number[];
}

export interface PagoClaroResumen {
    pagoClaroId: number;
    fechaPago: string;
    comprobante: string;
    observacion?: string | null;
    cantidadSots: number;
    pagadas: number;
    incompletas: number;
    noPagadas: number;
    totalACobrar: number;
    montoPagado: number;
    montoMultas: number;
    neto: number;                  // pagado - multas
    fechaCreacion: string;
}

export interface PagoClaroDetalle extends PagoClaroResumen {
    sotsDetalle: SotPago[];
    multasDetalle: MultaClaro[];
}
