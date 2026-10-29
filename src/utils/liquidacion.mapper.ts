import type { 
    FilaLiquidacionGrid, 
    CrearLiquidacionRequest, 
    EditarLiquidacionRequestDto 
  } from '../types/liquidacion.types';
  
  // Helper para empaquetar detalles (Drops, Baremos, Costos)
  const armarDetalles = (fila: Partial<FilaLiquidacionGrid>) => {
    const detalles = [];
    if (fila.costoServicio) detalles.push({ concepto: 'COSTO DE SERVICIO', cantidad: 1, precioTotal: Number(fila.costoServicio), precioUnitario: Number(fila.costoServicio), tipo: 1 });
    if (fila.deco) detalles.push({ concepto: 'DECO', cantidad: Number(fila.deco), precioTotal: 0, precioUnitario: 0, tipo: 1 });
    if (fila.repetidor) detalles.push({ concepto: 'REPETIDOR', cantidad: Number(fila.repetidor), precioTotal: 0, precioUnitario: 0, tipo: 1 });
    if (fila.drop150) detalles.push({ concepto: 'DROP 150', cantidad: Number(fila.drop150), precioTotal: 0, precioUnitario: 0, tipo: 1 });
    if (fila.drop220) detalles.push({ concepto: 'DROP 220', cantidad: Number(fila.drop220), precioTotal: 0, precioUnitario: 0, tipo: 1 });
    if (fila.drop300) detalles.push({ concepto: 'DROP 300', cantidad: Number(fila.drop300), precioTotal: 0, precioUnitario: 0, tipo: 1 });
    return detalles;
  };
  
  // Helper para empaquetar observaciones
  const armarObservaciones = (fila: Partial<FilaLiquidacionGrid>) => {
    const observaciones = [];
    if (fila.obsFotos) observaciones.push({ textoObservacion: fila.obsFotos, tipo: 1, motivoObservacionId: 1, usuarioId: 1 });
    if (fila.obsNoPago) observaciones.push({ textoObservacion: fila.obsNoPago, tipo: 2, motivoObservacionId: 1, usuarioId: 1 });
    if (fila.obsSiPago) observaciones.push({ textoObservacion: fila.obsSiPago, tipo: 3, motivoObservacionId: 1, usuarioId: 1 });
    return observaciones;
  };
  
  // Mapper para POST (Crear)
  export const mapGridToCrearDto = (fila: Partial<FilaLiquidacionGrid>): CrearLiquidacionRequest => ({
    sot: Number(fila.sot),
    tipoOrden: fila.tipoOrden || 'ORDEN',
    nombreSubTipoOrden: fila.subTipoOrden || 'INSTALACION',
    fechaProgramacion: fila.fechaProgramacion || '',
    nombreTecnico: fila.tecnico || '',
    estadoSistema: 1,
    usuarioId: 1,
    detalles: armarDetalles(fila),
    observaciones: armarObservaciones(fila)
  });
  
  // Mapper para PUT (Editar)
  export const mapGridToEditarDto = (fila: Partial<FilaLiquidacionGrid>): EditarLiquidacionRequestDto => ({
    liquidacionId: Number(fila.sot),
    sot: Number(fila.sot),
    tipoOrden: fila.tipoOrden || '',
    nombreSubTipoOrden: fila.subTipoOrden || '',
    fechaProgramacion: fila.fechaProgramacion || '',
    nombreTecnico: fila.tecnico || '',
    estadoSistema: 1,
    estadoPago: 1,
    detallesNuevos: armarDetalles(fila),
    detallesEditados: [],
    detallesEliminados: [],
    observacionesNuevas: armarObservaciones(fila),
    observacionesEditadas: [],
    observacionesEliminadas: []
  });