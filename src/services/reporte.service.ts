import { api } from '../api/api';

// Pide el Excel al back y lo descarga en el navegador
export const descargarReporte = async (ruta: string, anio: number, mes: number, nombre: string) => {
    try {
        // 'blob' = el back devuelve un archivo, no JSON
        const respuesta = await api.get<Blob>(ruta, { params: { anio, mes }, responseType: 'blob' });

        // truco para descargar: un link invisible que apunta al archivo en memoria
        const url = URL.createObjectURL(respuesta.data);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = nombre;
        enlace.click();
        URL.revokeObjectURL(url);   // libera la memoria
    } catch (e: any) {
        // el error también llega como Blob: se convierte a texto para leer { error }
        const datos = e?.response?.data;
        let mensaje: string | null = null;
        if (datos instanceof Blob) {
            try { mensaje = JSON.parse(await datos.text()).error ?? null; } catch { /* no era JSON (ej. 404 vacío) */ }
        }
        throw new Error(mensaje ?? (e?.response ? 'No se pudo generar el reporte' : 'No hay conexión con el servidor'));
    }
};
