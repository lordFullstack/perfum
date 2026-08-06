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

      supply_categories: {
        Row: {
          id: string;
          name: string;
        };
        Insert: Partial<Database["public"]["Tables"]["supply_categories"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["supply_categories"]["Row"]>;
        Relationships: [];
      };
      units_of_measure: {
        Row: {
          id: string;
          name: string;
          abbreviation: string;
        };
        Insert: Partial<Database["public"]["Tables"]["units_of_measure"]["Row"]> & {
          name: string;
          abbreviation: string;
        };
        Update: Partial<Database["public"]["Tables"]["units_of_measure"]["Row"]>;
        Relationships: [];
      };
      supplies: {
        Row: {
          id: string;
          branch_id: string;
          code: string;
          name: string;
          category_id: string;
          unit_id: string;
          stock: number;
          min_stock: number;
          average_cost: number;
          location: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["supplies"]["Row"]> & {
          branch_id: string;
          code: string;
          name: string;
          category_id: string;
          unit_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["supplies"]["Row"]>;
        Relationships: [];
      };
      stock_movements: {
        Row: {
          id: string;
          branch_id: string;
          supply_id: string;
          movement_type: string;
          quantity: number;
          unit_cost: number | null;
          reference_type: string | null;
          reference_id: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["stock_movements"]["Row"]> & {
          branch_id: string;
          supply_id: string;
          movement_type: string;
          quantity: number;
        };
        Update: Partial<Database["public"]["Tables"]["stock_movements"]["Row"]>;
        Relationships: [];
      };

      suppliers: {
        Row: {
          id: string;
          branch_id: string;
          name: string;
          tax_id: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["suppliers"]["Row"]> & {
          branch_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["suppliers"]["Row"]>;
        Relationships: [];
      };
      purchases: {
        Row: {
          id: string;
          branch_id: string;
          supplier_id: string;
          purchase_date: string;
          invoice_number: string | null;
          status: string;
          total_amount: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["purchases"]["Row"]> & {
          branch_id: string;
          supplier_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["purchases"]["Row"]>;
        Relationships: [];
      };
      purchase_items: {
        Row: {
          id: string;
          purchase_id: string;
          supply_id: string;
          quantity: number;
          unit_cost: number;
          batch_code: string | null;
          expiration_date: string | null;
          subtotal: number;
        };
        Insert: Partial<Database["public"]["Tables"]["purchase_items"]["Row"]> & {
          purchase_id: string;
          supply_id: string;
          quantity: number;
          unit_cost: number;
        };
        Update: Partial<Database["public"]["Tables"]["purchase_items"]["Row"]>;
        Relationships: [];
      };

      perfumes: {
        Row: {
          id: string;
          branch_id: string;
          code: string;
          name: string;
          description: string | null;
          category: string | null;
          base_price: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["perfumes"]["Row"]> & {
          branch_id: string;
          code: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["perfumes"]["Row"]>;
        Relationships: [];
      };
      recipes: {
        Row: {
          id: string;
          branch_id: string;
          perfume_id: string;
          version: number;
          is_active: boolean;
          yield_ml: number;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["recipes"]["Row"]> & {
          branch_id: string;
          perfume_id: string;
          version: number;
          yield_ml: number;
        };
        Update: Partial<Database["public"]["Tables"]["recipes"]["Row"]>;
        Relationships: [];
      };
      recipe_items: {
        Row: {
          id: string;
          recipe_id: string;
          supply_id: string;
          quantity: number;
          unit_id: string;
          notes: string | null;
          sort_order: number;
        };
        Insert: Partial<Database["public"]["Tables"]["recipe_items"]["Row"]> & {
          recipe_id: string;
          supply_id: string;
          quantity: number;
          unit_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["recipe_items"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      adjust_supply_stock: {
        Args: {
          p_supply_id: string;
          p_quantity: number;
          p_movement_type: string;
          p_unit_cost?: number | null;
          p_notes?: string | null;
        };
        Returns: Database["public"]["Tables"]["supplies"]["Row"];
      };
      create_purchase: {
        Args: {
          p_supplier_id: string;
          p_purchase_date: string;
          p_invoice_number: string | null;
          p_items: unknown;
        };
        Returns: Database["public"]["Tables"]["purchases"]["Row"];
      };
      cancel_purchase: {
        Args: { p_purchase_id: string };
        Returns: Database["public"]["Tables"]["purchases"]["Row"];
      };
      create_recipe: {
        Args: {
          p_perfume_id: string;
          p_yield_ml: number;
          p_notes: string | null;
          p_items: unknown;
        };
        Returns: string;
      };
      calculate_recipe_cost: {
        Args: { p_recipe_id: string };
        Returns: unknown;
      };
      check_recipe_feasibility: {
        Args: { p_recipe_id: string; p_quantity_to_produce: number };
        Returns: unknown;
      };
      duplicate_recipe: {
        Args: { p_recipe_id: string };
        Returns: unknown;
      };
    };
    Enums: Record<string, never>;
  };
}
