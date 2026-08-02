import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind evitando conflictos (ej. "p-2" vs "p-4"),
 * respetando condicionales. Usada por todos los componentes de ui/.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
