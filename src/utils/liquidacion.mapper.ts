import type {
    FilaLiquidacionGrid,
    CrearLiquidacionRequest,
    EditarLiquidacionRequestDto,
    AdicionalDto,
  } from '../types/liquidacion.types';

  // TipoDetalle del back
  const TIPO_SERVICIO = 0;
  const TIPO_ADICIONAL = 1;

  // Columna de la grilla → detalle del back. Costo de servicio guarda precio; el resto, cantidad.
  // tipoCatalogo: TipoAdicional del back para crear el precio en el catálogo (0 Adicional, 1 DROP150, 2 DROP220, 3 DROP300)
  export const CONCEPTOS: { campo: keyof FilaLiquidacionGrid; concepto: string; esPrecio?: boolean; tipoCatalogo?: number }[] = [
    { campo: 'costoServicio', concepto: 'COSTO DE SERVICIO', esPrecio: true },
    { campo: 'deco', concepto: 'DECO', tipoCatalogo: 0 },
    { campo: 'repetidor', concepto: 'REPETIDOR', tipoCatalogo: 0 },
    { campo: 'drop150', concepto: 'DROP 150', tipoCatalogo: 1 },
    { campo: 'drop220', concepto: 'DROP 220', tipoCatalogo: 2 },
    { campo: 'drop300', concepto: 'DROP 300', tipoCatalogo: 3 },
  ];

  export const CONCEPTOS_ADICIONALES = CONCEPTOS.filter((c) => !c.esPrecio);

  // concepto ('DROP 150') → precio unitario del catálogo
  export type PreciosAdicionales = Record<string, number>;

  export const preciosDesdeCatalogo = (catalogo: AdicionalDto[]): PreciosAdicionales =>
    Object.fromEntries(catalogo.map((a) => [a.nombre.trim().toUpperCase(), Number(a.precio) || 0]));

  // Lo mismo que calcula el back al guardar: costo de servicio + cantidad × precio de cada adicional
  export const calcularTotal = (fila: Partial<FilaLiquidacionGrid>, precios: PreciosAdicionales) =>
    CONCEPTOS.reduce((total, c) => {
      const valor = Number(fila[c.campo]) || 0;
      return total + (c.esPrecio ? valor : valor * (precios[c.concepto] ?? 0));
    }, 0);

  // El precio de los adicionales lo pone el back desde el catálogo; aquí solo viaja la cantidad
  const detalleDe = (c: typeof CONCEPTOS[number], valor: number) => c.esPrecio
    ? { concepto: c.concepto, cantidad: 1, precioUnitario: valor, precioTotal: valor, tipo: TIPO_SERVICIO }
    : { concepto: c.concepto, cantidad: Math.trunc(valor), precioUnitario: 0, precioTotal: 0, tipo: TIPO_ADICIONAL };

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
    // el back lo sobrescribe: se manda el que ya tenía (lo edita Auditoría), no el total calculado
    precioTotalEditable: fila.precioTotalEditable ?? undefined,
    estadoPago: 1,
    ...armarCambiosDetalles(fila),
    // El listado no devuelve observaciones, así que al editar no se sabe cuáles ya existen:
    // mandarlas otra vez las duplicaría. Por ahora solo se guardan al crear.
    observacionesNuevas: [],
    observacionesEditadas: [],
    observacionesEliminadas: []
  });
