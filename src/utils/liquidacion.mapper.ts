import type { 
    FilaLiquidacionGrid, 
    CrearLiquidacionRequest, 
    EditarLiquidacionRequestDto 
  } from '../types/liquidacion.types';
  
  // Columna de la grilla → detalle del back. Costo de servicio guarda precio; el resto, cantidad.
  const CONCEPTOS: { campo: keyof FilaLiquidacionGrid; concepto: string; esPrecio?: boolean }[] = [
    { campo: 'costoServicio', concepto: 'COSTO DE SERVICIO', esPrecio: true },
    { campo: 'deco', concepto: 'DECO' },
    { campo: 'repetidor', concepto: 'REPETIDOR' },
    { campo: 'drop150', concepto: 'DROP 150' },
    { campo: 'drop220', concepto: 'DROP 220' },
    { campo: 'drop300', concepto: 'DROP 300' },
  ];

  const detalleDe = (c: typeof CONCEPTOS[number], valor: number) => c.esPrecio
    ? { concepto: c.concepto, cantidad: 1, precioUnitario: valor, precioTotal: valor, tipo: 1 }
    : { concepto: c.concepto, cantidad: valor, precioUnitario: 0, precioTotal: 0, tipo: 1 };

  // Crear: todos los detalles con valor van como nuevos
  const armarDetalles = (fila: Partial<FilaLiquidacionGrid>) =>
    CONCEPTOS.filter((c) => Number(fila[c.campo]) > 0).map((c) => detalleDe(c, Number(fila[c.campo])));

  // Editar: los que ya existen se editan por id, los nuevos se agregan y los vaciados se eliminan (antes se duplicaban)
  const armarCambiosDetalles = (fila: Partial<FilaLiquidacionGrid>) => {
    const ids = fila.detallesIds ?? {};
    const nuevos = [], editados = [], eliminados: number[] = [];
    for (const c of CONCEPTOS) {
      const valor = Number(fila[c.campo]) || 0;
      const id = ids[c.concepto];
      if (valor > 0 && id) editados.push({ detalleId: id, ...detalleDe(c, valor) });
      else if (valor > 0) nuevos.push(detalleDe(c, valor));
      else if (id) eliminados.push(id);
    }
    return { detallesNuevos: nuevos, detallesEditados: editados, detallesEliminados: eliminados };
  };
  
  // Helper para empaquetar observaciones (TipoObservacion del back: FOTOS = 0, SI_PAGO = 1, NO_PAGO = 2)
  // Sin motivoObservacionId: es opcional y un id fijo que no exista rompe el guardado por clave foránea
  const armarObservaciones = (fila: Partial<FilaLiquidacionGrid>) => {
    const observaciones = [];
    if (fila.obsFotos) observaciones.push({ textoObservacion: fila.obsFotos, tipo: 0, usuarioId: 1 });
    if (fila.obsSiPago) observaciones.push({ textoObservacion: fila.obsSiPago, tipo: 1, usuarioId: 1 });
    if (fila.obsNoPago) observaciones.push({ textoObservacion: fila.obsNoPago, tipo: 2, usuarioId: 1 });
    return observaciones;
  };

  // El back recibe FechaProgramacion como DateTime: acepta 'YYYY-MM-DD' o 'DD/MM/YYYY'; vacía → hoy
  const normalizarFecha = (valor?: string) => {
    const texto = String(valor ?? '').trim();
    const ddmmyyyy = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`;
    return texto || new Date().toISOString().slice(0, 10);
  };

  // Mapper para POST (Crear)
  export const mapGridToCrearDto = (fila: Partial<FilaLiquidacionGrid>): CrearLiquidacionRequest => ({
    sot: Number(fila.sot),
    tipoOrden: fila.tipoOrden || 'ORDEN',
    nombreSubTipoOrden: fila.subTipoOrden || 'INSTALACION',
    fechaProgramacion: normalizarFecha(fila.fechaProgramacion),
    nombreTecnico: fila.tecnico || '',
    estadoSistema: 0,   // Estados.INGRESADA
    usuarioId: 1,
    detalles: armarDetalles(fila),
    observaciones: armarObservaciones(fila)
  });

  // Mapper para PUT (Editar): el back busca la liquidación por SOT
  export const mapGridToEditarDto = (fila: Partial<FilaLiquidacionGrid>): EditarLiquidacionRequestDto => ({
    liquidacionId: Number(fila.liquidacionId ?? 0),
    sot: Number(fila.sot),
    tipoOrden: fila.tipoOrden || '',
    nombreSubTipoOrden: fila.subTipoOrden || '',
    fechaProgramacion: normalizarFecha(fila.fechaProgramacion),
    nombreTecnico: fila.tecnico || '',
    estadoSistema: fila.estadoSistema ?? 0,   // conserva el estado que tenía (antes se pisaba con 1)
    precioTotalEditable: fila.total,          // el back lo sobrescribe: si no se manda, borra el total
    estadoPago: 1,
    ...armarCambiosDetalles(fila),
    // El listado no devuelve observaciones, así que al editar no se sabe cuáles ya existen:
    // mandarlas otra vez las duplicaría. Por ahora solo se guardan al crear.
    observacionesNuevas: [],
    observacionesEditadas: [],
    observacionesEliminadas: []
  });