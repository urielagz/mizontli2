// Archivo de apoyo subido por el docente al crear/editar una actividad.
export interface ArchivoApoyo {
    url: string;
    nombre_original: string;
}

export interface Actividad {

    id_actividad?: number;

    titulo: string;

    descripcion?: string;

    fecha_limite?: Date;

    puntaje?: number;

    archivos_permitidos?: string;

    archivos_apoyo?: ArchivoApoyo[];

    id_tema: number;

    id_docente?: number;

}

// Entrega de un alumno para una actividad (tabla actividad_completada).
export interface EntregaActividad {

    id_registro?: number;

    id_usuario: number;

    id_actividad: number;

    archivo_url?: string;

    nombre_original?: string;

    url_entrega?: string;

    fecha_entrega?: Date;

    calificacion?: number | null;

    comentario_alumno?: string;

    observaciones_docente?: string;

}
