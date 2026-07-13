import multer from "multer";
import path from "path";
import fs from "fs";

// Multer dedicado al módulo académico (recursos de un tema y entregas de
// actividades). No comparte configuración con config/upload.ts, que es el
// usado por el flujo de solicitud de docentes (sistema de usuarios).

const RECURSOS_PATH = path.join(process.env.UPLOADS_PATH || "uploads", "recursos");
const ENTREGAS_PATH = path.join(process.env.UPLOADS_PATH || "uploads", "entregas");
const ACTIVIDADES_PATH = path.join(process.env.UPLOADS_PATH || "uploads", "actividades");

for (const ruta of [RECURSOS_PATH, ENTREGAS_PATH, ACTIVIDADES_PATH]) {
    if (!fs.existsSync(ruta)) {
        fs.mkdirSync(ruta, { recursive: true });
    }
}

const EXTENSIONES_PERMITIDAS = [
    // documentos
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv", ".odt", ".ods", ".odp",
    // imágenes
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg",
    // video
    ".mp4", ".mov", ".avi", ".mkv", ".webm",
    // audio
    ".mp3", ".wav", ".ogg",
    // comprimidos
    ".zip", ".rar",
    // código
    ".js", ".ts", ".py", ".java", ".c", ".cpp", ".html", ".css", ".json"
];

function crearStorage(destino: string) {
    return multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, destino),
        filename: (_req, file, cb) => {
            // El nombre original puede venir con "../" o separadores de ruta;
            // nos quedamos solo con el basename y sanitizamos antes de escribir en disco.
            const nombreBase = path
                .basename(file.originalname)
                .replace(/[^a-zA-Z0-9._-]/g, "_");

            cb(null, `${Date.now()}-${nombreBase}`);
        },
    });
}

function filtroArchivos(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    const ext = path.extname(file.originalname).toLowerCase();

    if (EXTENSIONES_PERMITIDAS.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Formato de archivo no permitido."));
    }
}

export const uploadRecurso = multer({
    storage: crearStorage(RECURSOS_PATH),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    fileFilter: filtroArchivos,
});

export const uploadEntrega = multer({
    storage: crearStorage(ENTREGAS_PATH),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    fileFilter: filtroArchivos,
});

// Archivos de apoyo que el docente adjunta a una actividad (opcionales,
// pueden ser varios).
export const uploadActividadApoyo = multer({
    storage: crearStorage(ACTIVIDADES_PATH),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    fileFilter: filtroArchivos,
});

export function clasificarTipo(extension: string): string {
    const ext = extension.toLowerCase().replace(".", "");

    if (ext === "pdf") return "pdf";
    if (["doc", "docx", "odt"].includes(ext)) return "word";
    if (["xls", "xlsx", "ods"].includes(ext)) return "excel";
    if (["ppt", "pptx", "odp"].includes(ext)) return "powerpoint";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "imagen";
    if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return "video";
    if (["mp3", "wav", "ogg"].includes(ext)) return "audio";
    if (ext === "zip") return "zip";
    if (ext === "rar") return "rar";

    return "otro";
}
