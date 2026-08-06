const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

/**
 * Genera una contraseña temporal de 12 caracteres, sin ambigüedades
 * visuales (excluye 0/O, 1/l/I). El usuario debe cambiarla en su
 * primer inicio de sesión (comunicación manual por ahora — el flujo
 * de "forzar cambio de contraseña" queda para una fase posterior).
 */
export function generateTemporaryPassword(length = 12): string {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => CHARS[n % CHARS.length]).join("");
}
