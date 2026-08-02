import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/infrastructure/supabase/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. " +
      "Copia .env.example a .env y completa los valores de tu proyecto Supabase.",
  );
}

/**
 * Cliente único de Supabase para toda la app.
 * Solo la capa de infraestructura importa este archivo —
 * el dominio y la presentación nunca hablan con Supabase directamente.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
