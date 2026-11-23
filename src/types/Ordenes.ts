// Tipos de la orden de trabajo (OT): espejo de los DTOs del back
// (backend-claro.Application/DTOs/OrdenesTrabajos y Domain/Enums/EstadoClaro).
// La OT es el registro del técnico: SOT, trabajo realizado, estado en campo y sus imágenes.
// Montos, detalles, auditoría y pago viven en la Liquidación, no aquí.

// Estado de la SOT en el sistema de Claro (TOA). El back lo serializa como número.
export const EstadoClaro = {
    COMPLETADO: 0,
    NO_COMPLETADO: 1,
    EN_PROGRESO: 2,
} as const;
export type EstadoClaro = typeof EstadoClaro[keyof typeof EstadoClaro];

export const EstadoFotos =
{
    PENDIENTE: 0,   // el técnico subió (o volvió a subir) y almacén no ha revisado
    CORRECTO: 1,    // almacén las aprobó
    OBSERVADO: 2    // almacén encontró algo mal → hay texto de observación
} as const;
export type EstadoFotos = typeof EstadoFotos[keyof typeof EstadoFotos];

//para validar solo la imagen

// PATCH aprobar-sot: almacén decide si la SOT procede a pago (la SOT va para que el back compruebe que es la de la orden)
export interface AprobarSotRequest {
    sot: number;
    procedePago: boolean;
    motivo?: string;
}

export interface validarImagen{
    estadoAlmacen: EstadoFotos ;
    observacion?: string;
}



// ArchivoResponse
export interface ArchivoOrden {
    archivoId: number;
    nombreArchivo: string;
    src: string;        // ruta relativa al servidor, p. ej. "/uploads/abc.jpg"
    url: string;        // hoy el back la manda vacía: usar src
}

// OrdenListaResponse
export interface OrdenTrabajo {
    ordenTrabajoId: number;
    sot: number;
    docTecnico: string;
    trabajoRealizado: string;
    estadoCampo: EstadoClaro;
    archivos: ArchivoOrden[];
    usuarioId: number;
    estadoAlmacen: EstadoFotos ;
    observacion?: string;// Usuario.Id (perfil) del técnico
    procedePago?:boolean;
    
}

// ListRequestOrdenesDto (query de GET OrdenTrabajo/List)
export interface ListarOrdenesParams {
    pagina?: number;
    canPagina?: number;     // máx. 50 en el back
    buscar?: string;        // SOT o parte de ella
    tecnicoId?: number;     // Usuario.Id; para un técnico el back lo ignora
    desde?: string;         // yyyy-mm-dd (fecha de registro)
    hasta?: string;         // yyyy-mm-dd, inclusive
}

// CrearOrdenTrabajoRequest + las imágenes (multipart, campo "imagenes")
export interface CrearOrdenRequest {
    sot: number;
    docTecnico: string;
    trabajoRealizado: string;   // máx. 150 caracteres
    estadoCampo: EstadoClaro;
    usuarioId: number;          // si quien crea es técnico, el back usa el suyo
    imagenes: File[];
}

// EdicionRapidaRequest: solo se manda lo que cambia
export interface EdicionRapidaRequest {
    sot?: number;
    docTecnico?: string;
    trabajoRealizado?: string;
    estadoCampo?: EstadoClaro;
    usuarioId?: number;
}

export const MAX_TRABAJO_REALIZADO = 150;
