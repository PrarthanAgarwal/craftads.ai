import { Json } from './json.types';

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          auth_provider: string | null;
          auth_provider_id: string | null;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          credits_balance: number;
          created_at: string;
          updated_at: string;
          last_login: string | null;
          is_verified: boolean;
          is_active: boolean;
          metadata: Json;
        };
        Insert: {
          id: string;
          email: string;
          auth_provider?: string | null;
          auth_provider_id?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          credits_balance?: number;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          metadata?: Json;
        };
        Update: {
          id?: string;
          email?: string;
          auth_provider?: string | null;
          auth_provider_id?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          credits_balance?: number;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "users_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          default_ai_model: string | null;
          favorite_templates: Json;
          ui_preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          default_ai_model?: string | null;
          favorite_templates?: Json;
          ui_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          default_ai_model?: string | null;
          favorite_templates?: Json;
          ui_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      credit_packages: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          credit_amount: number;
          price: number;
          currency: string;
          is_active: boolean;
          is_featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          credit_amount: number;
          price: number;
          currency?: string;
          is_active?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          credit_amount?: number;
          price?: number;
          currency?: string;
          is_active?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: string;
          reference_id: string | null;
          reference_type: string | null;
          description: string | null;
          balance_after: number;
          created_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: string;
          reference_id?: string | null;
          reference_type?: string | null;
          description?: string | null;
          balance_after: number;
          created_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: string;
          reference_id?: string | null;
          reference_type?: string | null;
          description?: string | null;
          balance_after?: number;
          created_at?: string;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "credit_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          package_id: string | null;
          provider: string;
          provider_payment_id: string | null;
          amount: number;
          currency: string;
          status: string;
          credits_purchased: number;
          created_at: string;
          updated_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          package_id?: string | null;
          provider: string;
          provider_payment_id?: string | null;
          amount: number;
          currency?: string;
          status?: string;
          credits_purchased: number;
          created_at?: string;
          updated_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          package_id?: string | null;
          provider?: string;
          provider_payment_id?: string | null;
          amount?: number;
          currency?: string;
          status?: string;
          credits_purchased?: number;
          created_at?: string;
          updated_at?: string;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "payments_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "credit_packages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          template_id: string | null;
          template_source_id: string | null;
          status: string;
          result_image_url: string | null;
          ai_model: string;
          prompt_data: Json;
          customization_data: Json;
          processing_time: number | null;
          credits_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id?: string | null;
          template_source_id?: string | null;
          status?: string;
          result_image_url?: string | null;
          ai_model?: string;
          prompt_data?: Json;
          customization_data?: Json;
          processing_time?: number | null;
          credits_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          template_id?: string | null;
          template_source_id?: string | null;
          status?: string;
          result_image_url?: string | null;
          ai_model?: string;
          prompt_data?: Json;
          customization_data?: Json;
          processing_time?: number | null;
          credits_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "generations_template_source_id_fkey";
            columns: ["template_source_id"];
            isOneToOne: false;
            referencedRelation: "ad_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "generations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      // New tables for the gallery system
      template_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon_name: string | null;
          color: string | null;
          parent_id: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon_name?: string | null;
          color?: string | null;
          parent_id?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon_name?: string | null;
          color?: string | null;
          parent_id?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "template_categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "template_categories";
            referencedColumns: ["id"];
          }
        ];
      };
      ad_templates: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          preview_image_url: string;
          width: number;
          height: number;
          is_premium: boolean;
          is_featured: boolean;
          is_active: boolean;
          view_count: number;
          usage_count: number;
          tags: string[];
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          preview_image_url: string;
          width: number;
          height: number;
          is_premium?: boolean;
          is_featured?: boolean;
          is_active?: boolean;
          view_count?: number;
          usage_count?: number;
          tags?: string[];
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          preview_image_url?: string;
          width?: number;
          height?: number;
          is_premium?: boolean;
          is_featured?: boolean;
          is_active?: boolean;
          view_count?: number;
          usage_count?: number;
          tags?: string[];
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      template_category_relationships: {
        Row: {
          id: string;
          template_id: string;
          category_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          category_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          category_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "template_category_relationships_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "template_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "template_category_relationships_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "ad_templates";
            referencedColumns: ["id"];
          }
        ];
      };
      user_favorite_templates: {
        Row: {
          id: string;
          user_id: string;
          template_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          template_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_favorite_templates_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "ad_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_favorite_templates_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      template_feedback: {
        Row: {
          id: string;
          user_id: string;
          template_id: string;
          rating: number;
          comments: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id: string;
          rating: number;
          comments?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          template_id?: string;
          rating?: number;
          comments?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "template_feedback_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "ad_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "template_feedback_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {
      search_templates: {
        Args: {
          search_query: string | null;
          category_slug: string | null;
          limit_count: number | null;
          offset_count: number | null;
        };
        Returns: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          preview_image_url: string;
          width: number;
          height: number;
          is_premium: boolean;
          is_featured: boolean;
          categories: Json;
          tags: string[];
          view_count: number;
          usage_count: number;
        }[];
      };
      begin_transaction: {
        Args: Record<string, never>;
        Returns: { success: boolean };
      };
      commit_transaction: {
        Args: Record<string, never>;
        Returns: { success: boolean };
      };
      rollback_transaction: {
        Args: Record<string, never>;
        Returns: { success: boolean };
      };
    };
    Enums: {};
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never 