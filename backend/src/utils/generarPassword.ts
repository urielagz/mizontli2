import crypto from "crypto";

export function generarPasswordTemporal(longitud: number = 10): string {
    return crypto
        .randomBytes(longitud)
        .toString("base64")
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, longitud);
}