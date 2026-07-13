export type TipoRecurso =
    | "informacion"
    | "documento"
    | "video"
    | "enlace"
    | "pdf"
    | "word"
    | "excel"
    | "powerpoint"
    | "imagen"
    | "audio"
    | "zip"
    | "rar"
    | "otro";

export interface Recurso {

    id_recurso?: number;

    titulo: string;

    descripcion?: string;

    tipo: TipoRecurso;

    url_archivo: string;

    nombre_original?: string;

    extension?: string;

    tamano_bytes?: number;

    fecha_publicacion?: Date;

    id_tema: number;

    id_usuario: number;

}
