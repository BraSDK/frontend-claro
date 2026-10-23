import { MAX_TRABAJO_REALIZADO, type EstadoClaro } from '../../types/Ordenes';

// Valores del formulario de la orden (como los escribe el usuario) y su validación, con las mismas reglas que el back
export interface ValoresOrden {
    sot: string;
    docTecnico: string;
    trabajoRealizado: string;
    estadoCampo: EstadoClaro;
}

export const validarOrden = (v: ValoresOrden): string | null => {
    if (!/^\d+$/.test(v.sot) || Number(v.sot) <= 0) return 'La SOT debe ser un número mayor a 0.';
    if (!v.docTecnico.trim()) return 'Ingresa el documento del técnico.';
    if (!v.trabajoRealizado.trim()) return 'Describe el trabajo realizado.';
    if (v.trabajoRealizado.trim().length > MAX_TRABAJO_REALIZADO) return `El trabajo realizado no puede superar los ${MAX_TRABAJO_REALIZADO} caracteres.`;
    return null;
};
