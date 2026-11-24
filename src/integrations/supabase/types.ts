export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      account_entitlements: {
        Row: {
          credits: number
          expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          credits?: number
          expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          credits?: number
          expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_gateway_control: {
        Row: {
          http_status: number | null
          paused: boolean
          safe_message: string | null
          state_key: string
          updated_at: string
        }
        Insert: {
          http_status?: number | null
          paused?: boolean
          safe_message?: string | null
          state_key: string
          updated_at?: string
        }
        Update: {
          http_status?: number | null
          paused?: boolean
          safe_message?: string | null
          state_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_uploads: {
        Row: {
          created_at: string
          expires_at: string
          file_name: string
          file_size: number
          id: string
          mime_type: string
          session_id: string
          storage_path: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          file_name: string
          file_size: number
          id?: string
          mime_type: string
          session_id: string
          storage_path: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          file_name?: string
          file_size?: number
          id?: string
          mime_type?: string
          session_id?: string
          storage_path?: string
          user_id?: string | null
        }
        Relationships: []
      }
      editing_history: {
        Row: {
          created_at: string
          document_name: string
          document_type: string | null
          edited_fields: Json | null
          id: string
          thumbnail_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type?: string | null
          edited_fields?: Json | null
          id?: string
          thumbnail_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string | null
          edited_fields?: Json | null
          id?: string
          thumbnail_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          telegram_user_id: number | null
          telegram_username: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          telegram_user_id?: number | null
          telegram_username?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          telegram_user_id?: number | null
          telegram_username?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      registration_orders: {
        Row: {
          created_at: string
          credits: number
          duration_days: number
          fulfilled_at: string | null
          id: string
          invoice_id: number | null
          invoice_url: string | null
          package_code: string
          price_usd: number
          processing_until: string | null
          status: string
          telegram_user_id: number
        }
        Insert: {
          created_at?: string
          credits?: number
          duration_days?: number
          fulfilled_at?: string | null
          id?: string
          invoice_id?: number | null
          invoice_url?: string | null
          package_code: string
          price_usd: number
          processing_until?: string | null
          status?: string
          telegram_user_id: number
        }
        Update: {
          created_at?: string
          credits?: number
          duration_days?: number
          fulfilled_at?: string | null
          id?: string
          invoice_id?: number | null
          invoice_url?: string | null
          package_code?: string
          price_usd?: number
          processing_until?: string | null
          status?: string
          telegram_user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "registration_orders_package_code_fkey"
            columns: ["package_code"]
            isOneToOne: false
            referencedRelation: "registration_packages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "registration_orders_telegram_user_id_fkey"
            columns: ["telegram_user_id"]
            isOneToOne: false
            referencedRelation: "telegram_accounts"
            referencedColumns: ["telegram_user_id"]
          },
        ]
      }
      registration_packages: {
        Row: {
          code: string
          credits: number
          duration_days: number
          enabled: boolean
          name: string
          price_usd: number
          updated_at: string
        }
        Insert: {
          code: string
          credits?: number
          duration_days?: number
          enabled?: boolean
          name: string
          price_usd: number
          updated_at?: string
        }
        Update: {
          code?: string
          credits?: number
          duration_days?: number
          enabled?: boolean
          name?: string
          price_usd?: number
          updated_at?: string
        }
        Relationships: []
      }
      telegram_accounts: {
        Row: {
          created_at: string
          telegram_user_id: number
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          telegram_user_id: number
          user_id?: string
          username: string
        }
        Update: {
          created_at?: string
          telegram_user_id?: number
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      telegram_update_receipts: {
        Row: {
          completed_at: string | null
          created_at: string
          processing_until: string | null
          update_id: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          processing_until?: string | null
          update_id: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          processing_until?: string | null
          update_id?: number
        }
        Relationships: []
      }
      website_settings: {
        Row: {
          description: string
          id: boolean
          title: string
          updated_at: string
        }
        Insert: {
          description?: string
          id?: boolean
          title?: string
          updated_at?: string
        }
        Update: {
          description?: string
          id?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      website_metadata: {
        Row: {
          description: string | null
          title: string | null
        }
        Insert: {
          description?: string | null
          title?: string | null
        }
        Update: {
          description?: string | null
          title?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      complete_registration_order: {
        Args: { order_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
