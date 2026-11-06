export interface CrearDetalleRequest {
    concepto: string;
    precioUnitario: number;
    cantidad: number;
    tipo: number | string;
}

export interface EditarDetalleRequest {
    detalleId: number;            // así se llama en el back (EditarDetalleRequest.DetalleId)
    concepto?: string;
    precioUnitario?: number;
    cantidad?: number;
    tipo?: number | string;
}

export interface DetalleResponseDto {
    detalleLiquidacionId: number;
    concepto: string;
    precioUnitario: number;
    cantidad: number;
    precioTotal: number;
    tipo: number | string;
  }
  
  // Igual que CrearObservacionDto del back
  export interface CrearObservacionDto {
    textoObservacion?: string;
    tipo: number;                 // TipoObservacion: FOTOS = 0, SI_PAGO = 1, NO_PAGO = 2
    motivoObservacionId?: number;
    usuarioId: number;
  }
  
  // Igual que EditarObservacionDto del back
  export interface EditarObservacionDto {
    observacionLiquidacionId: number;
    texto?: string;
    motivoObservacionId?: number;
  }

  export interface ObservacionResponseDto {
    observacionLiquidacionId: number;
    tipo: number;                 // TipoObservacion: FOTOS = 0, SI_PAGO = 1, NO_PAGO = 2
    texto?: string | null;
  }
  
  // ==========================================
  // 2. PARÁMETROS DE BÚSQUEDA (GET)
  // ==========================================
  export interface ListParamsLiquidacionesDto {
    pagina?: number;      // Por defecto en C# es 1
    canPagina?: number;   // Por defecto en C# es 15
    buscar?: string;
    estado?: number | string;
    auditada?: boolean;
    desde?: string;       // Formato ISO 8601 (YYYY-MM-DD)
    hasta?: string;
  }
  
  // ==========================================
  // 3. REQUESTS (Mutaciones)
  // ==========================================
  export interface CrearLiquidacionRequest {
    sot: number;
    tipoOrden?: string;
    nombreSubTipoOrden: string;
    fechaProgramacion: string;
    nombreTecnico?: string;
    estadoSistema: number | string;
    detalles: CrearDetalleRequest[];
    estadoSot?: string;
    ordenTrabajoId?: number;
    usuarioId: number;
    observaciones: CrearObservacionDto[];
  }
  
  export interface EditarLiquidacionRequestDto {
    liquidacionId: number;
    sot: number;
    tipoOrden?: string;
    nombreSubTipoOrden: string;
    fechaProgramacion: string;
    nombreTecnico?: string;
    estadoSistema: number | string;
    detallesNuevos: CrearDetalleRequest[];
    detallesEditados: EditarDetalleRequest[];
    detallesEliminados: number[]; // Array de IDs
    precioTotalEditable?: number;
    estadoSot?: string;
    estadoPago: number | string;
    observacionesNuevas: CrearObservacionDto[];
    observacionesEditadas: EditarObservacionDto[];
    observacionesEliminadas: number[]; // Array de IDs
  }
  
  // ==========================================
  // 4. RESPUESTAS (Responses)
  // ==========================================
  export interface ListarRequestLiquidacionesDto {
    liquidacionId: number;
    sot: number;
    tipoOrden?: string;
    nombreSubTipoOrden: string;
    fechaProgramacion: string;
    nombreTecnico?: string;
    estadoSistema: number | string;
    detallesLiquidacion: DetalleResponseDto[];
    precioTotalReal?: number | null;      // calculado por el back con los precios del catálogo
    precioTotalEditable?: number | null;
    estadoPago?: number;                  // EstadoPago: 2 = no pagará
    observaciones?: ObservacionResponseDto[];
  }
  
  // Si devuelves paginación estándar, este es el Wrapper
  export interface PagedResult<T> {
    items: T[];
    totalRecords: number;
    pagina: number;
    canPagina: number;
    totalPages: number;
  }

  export type FilaLiquidacionGrid = {
    liquidacionId?: number;
    sot?: number;
    tecnico?: string;
    tipoOrden?: string;
    fechaProgramacion?: string;
    subTipoOrden?: string;
    costoServicio?: number;
    deco?: number;
    repetidor?: number;
    drop150?: number;
    drop220?: number;
    drop300?: number;
    obsFotos?: string;
    obsNoPago?: string;
    obsSiPago?: string;
    total?: number;                       // calculado: costo de servicio + cantidades × precio del catálogo
    precioTotalEditable?: number | null;  // lo edita Auditoría; aquí solo se conserva
    estadoSistema?: number | string;   // se conserva al editar
    detallesIds?: Record<string, number>;
    observacionesIds?: Record<number, number>;   // tipo de observación → observacionLiquidacionId   // concepto → detalleLiquidacionId (para editar/eliminar sin duplicar)
    esRegistroExistente?: boolean;
    miClaseFila?: string;
  };

  // Catálogo de precios de adicionales (api/Adicional). Tipo: 0 Adicional, 1 DROP150, 2 DROP220, 3 DROP300
  export interface AdicionalDto {
    adicionalId: number;
    nombre: string;
    precio: number;
    tipo: number;
    columnaExcel?: string | null;
  }

  export type GuardarAdicionalDto = Omit<AdicionalDto, 'adicionalId'>;
