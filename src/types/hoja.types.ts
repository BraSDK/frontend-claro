// Igual que HojaDto del back: una pestaña (mes) de la grilla de liquidaciones
export interface Hoja {
    hojaId: number;
    nombre: string;
    anio: number;
    mes: number;                     // 1..12
    cantidadLiquidaciones: number;
}
