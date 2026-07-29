// Edge Function: admin-create-user
//
// Crea un usuario en Supabase Auth + su fila en `profiles`, en la misma
// sucursal que el administrador que invita. Es la ÚNICA pieza del sistema
// que usa la service_role key — por eso vive acá y no en el frontend.
//
// Seguridad:
//   1. Requiere JWT válido (verify_jwt=true en el deploy).
//   2. Verifica explícitamente que quien llama tiene rol 'admin'
//      (no confía únicamente en verify_jwt, que solo confirma que
//      el usuario está autenticado, no qué puede hacer).
//   3. Si falla la creación del perfil tras crear el usuario de Auth,
//      revierte (borra el usuario de Auth) para no dejar huérfanos.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

interface RequestBody {
  fullName?: string;
  email?: string;
  phone?: string | null;
  roleId?: string;
  temporaryPassword?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "No autorizado." }, 401);

    // Cliente "como el que llama" — sirve solo para identificar quién es.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await callerClient.auth.getUser();

    if (userError || !user) return json({ error: "No autorizado." }, 401);

    // Cliente con privilegios de servicio para las operaciones que RLS
    // no permite desde el cliente (crear usuarios de Auth, insertar
    // perfiles ajenos).
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("branch_id, roles:role_id ( name )")
      .eq("id", user.id)
      .single();

    const callerRole = (callerProfile?.roles as unknown as { name: string } | null)?.name;

    if (profileError || !callerProfile || callerRole !== "admin") {
      return json({ error: "Solo un administrador puede crear usuarios." }, 403);
    }

    const body: RequestBody = await req.json();
    const { fullName, email, phone, roleId, temporaryPassword } = body;

    if (!fullName || !email || !roleId || !temporaryPassword) {
      return json({ error: "Faltan datos obligatorios." }, 400);
    }
    if (temporaryPassword.length < 8) {
      return json({ error: "La contraseña temporal debe tener al menos 8 caracteres." }, 400);
    }

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
    });

    if (createError || !created.user) {
      const message = createError?.message?.includes("already been registered")
        ? "Ya existe un usuario con ese correo."
        : (createError?.message ?? "No se pudo crear el usuario.");
      return json({ error: message }, 400);
    }

    const { data: profile, error: insertError } = await adminClient
      .from("profiles")
      .insert({
        id: created.user.id,
        branch_id: callerProfile.branch_id,
        role_id: roleId,
        full_name: fullName,
        email,
        phone: phone ?? null,
      })
      .select("id, full_name, email, phone, is_active, created_at, role_id, roles:role_id ( name )")
      .single();

    if (insertError || !profile) {
      // Revierte: no dejamos un usuario de Auth sin perfil asociado.
      await adminClient.auth.admin.deleteUser(created.user.id);
      return json({ error: "No se pudo crear el perfil del usuario." }, 400);
    }

    return json(profile, 200);
  } catch {
    return json({ error: "Error inesperado creando el usuario." }, 500);
  }
});
