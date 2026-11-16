// utils/columnasExcel.ts
export const COLUMNAS_CONOCIDAS = {
    sot:        ['NRO SOT', 'SOT', 'NRO_SOT', 'NUMERO SOT'],
    monto:      ['PRECIARIO', 'COSTO INST DTH', 'FACT COBRO INST', 'MONTO', 'MONTO PAGADO'],
    mesPago:    ['MES PAGO', 'MES', 'MESPAGO'],
    semanaPago: ['SEMANA PAGO', 'SEMANA', 'SEMANAPAGO'],
    observacion:['OBSERVACION', 'OBSERVACIONES', 'OBS', 'OBS.'],
} as const;

export type ClaveColumna = keyof typeof COLUMNAS_CONOCIDAS;

// Busca el primer header que coincida con algún alias (case-insensitive, trim)
export const detectarColumna = (titulos: string[], clave: ClaveColumna): number => {
    const alias = COLUMNAS_CONOCIDAS[clave].map(a => a.toUpperCase().trim());
    return titulos.findIndex(t => alias.includes(String(t).toUpperCase().trim()));
};