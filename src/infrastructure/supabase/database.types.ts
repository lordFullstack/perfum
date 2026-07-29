/**
 * Tipos de la base de datos Supabase.
 *
 * NOTA: este archivo se regenerará automáticamente cuando el proyecto
 * Supabase real exista, con:
 *   npx supabase gen types typescript --project-id <id> > src/infrastructure/supabase/database.types.ts
 *
 * Por ahora se mantiene a mano, reflejando el esquema SQL de la Fase 0.
 * Se amplía en cada fase con las tablas que se van incorporando.
 */

export interface Database {
  public: {
    Tables: {
      branches: {
        Row: {
          id: string;
          name: string;
          code: string;
          address: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["branches"]["Row"]> & {
          name: string;
          code: string;
        };
        Update: Partial<Database["public"]["Tables"]["branches"]["Row"]>;
        Relationships: [];
      };
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_system: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["roles"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["roles"]["Row"]>;
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          module: string;
          action: string;
          code: string;
        };
        Insert: Partial<Database["public"]["Tables"]["permissions"]["Row"]> & {
          module: string;
          action: string;
          code: string;
        };
        Update: Partial<Database["public"]["Tables"]["permissions"]["Row"]>;
        Relationships: [];
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
        };
        Insert: Database["public"]["Tables"]["role_permissions"]["Row"];
        Update: Partial<Database["public"]["Tables"]["role_permissions"]["Row"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          branch_id: string;
          role_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          branch_id: string;
          role_id: string;
          full_name: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
