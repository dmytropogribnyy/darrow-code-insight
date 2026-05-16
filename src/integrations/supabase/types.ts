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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      astro_data: {
        Row: {
          birth_time_source: string | null
          calculation_date: string | null
          created_at: string
          generated_at: string | null
          id: string
          intake_id: string
          normalized_json: Json | null
          provider_name: string | null
          provider_version: string | null
          raw_json: Json | null
          timezone_used: string | null
        }
        Insert: {
          birth_time_source?: string | null
          calculation_date?: string | null
          created_at?: string
          generated_at?: string | null
          id?: string
          intake_id: string
          normalized_json?: Json | null
          provider_name?: string | null
          provider_version?: string | null
          raw_json?: Json | null
          timezone_used?: string | null
        }
        Update: {
          birth_time_source?: string | null
          calculation_date?: string | null
          created_at?: string
          generated_at?: string | null
          id?: string
          intake_id?: string
          normalized_json?: Json | null
          provider_name?: string | null
          provider_version?: string | null
          raw_json?: Json | null
          timezone_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "astro_data_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
        }
        Relationships: []
      }
      generation_jobs: {
        Row: {
          attempt_count: number
          created_at: string
          id: string
          last_error: string | null
          order_id: string
          status: Database["public"]["Enums"]["generation_job_status"]
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          id?: string
          last_error?: string | null
          order_id: string
          status?: Database["public"]["Enums"]["generation_job_status"]
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          id?: string
          last_error?: string | null
          order_id?: string
          status?: Database["public"]["Enums"]["generation_job_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_jobs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      intakes: {
        Row: {
          birth_city: string
          birth_country: string | null
          birth_time: string | null
          birth_time_known: boolean
          created_at: string
          customer_id: string
          date_of_birth: string
          full_name_for_numerology: string | null
          geocoding_provider: string | null
          id: string
          latitude: number | null
          longitude: number | null
          partner_data: Json | null
          partner_data_delete_at: string | null
          resolved_birth_place_name: string | null
          timezone: string | null
          timezone_source: string | null
        }
        Insert: {
          birth_city: string
          birth_country?: string | null
          birth_time?: string | null
          birth_time_known?: boolean
          created_at?: string
          customer_id: string
          date_of_birth: string
          full_name_for_numerology?: string | null
          geocoding_provider?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          partner_data?: Json | null
          partner_data_delete_at?: string | null
          resolved_birth_place_name?: string | null
          timezone?: string | null
          timezone_source?: string | null
        }
        Update: {
          birth_city?: string
          birth_country?: string | null
          birth_time?: string | null
          birth_time_known?: boolean
          created_at?: string
          customer_id?: string
          date_of_birth?: string
          full_name_for_numerology?: string | null
          geocoding_provider?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          partner_data?: Json | null
          partner_data_delete_at?: string | null
          resolved_birth_place_name?: string | null
          timezone?: string | null
          timezone_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intakes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      modules_purchased: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          intake_id: string
          module_code: Database["public"]["Enums"]["module_code"]
          order_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          intake_id: string
          module_code: Database["public"]["Enums"]["module_code"]
          order_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          intake_id?: string
          module_code?: Database["public"]["Enums"]["module_code"]
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_purchased_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modules_purchased_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "intakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modules_purchased_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_cents: number
          created_at: string
          customer_id: string
          id: string
          intake_id: string
          status: Database["public"]["Enums"]["order_status"]
          stripe_session_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          customer_id: string
          id?: string
          intake_id: string
          status?: Database["public"]["Enums"]["order_status"]
          stripe_session_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          customer_id?: string
          id?: string
          intake_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          stripe_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          ai_content_json: Json | null
          created_at: string
          customer_id: string
          download_token: string
          generation_error: string | null
          generation_status: Database["public"]["Enums"]["report_generation_status"]
          id: string
          intake_id: string
          model_used: string | null
          modules_array: Database["public"]["Enums"]["module_code"][]
          pdf_url: string | null
          ready_email_sent_at: string | null
        }
        Insert: {
          ai_content_json?: Json | null
          created_at?: string
          customer_id: string
          download_token?: string
          generation_error?: string | null
          generation_status?: Database["public"]["Enums"]["report_generation_status"]
          id?: string
          intake_id: string
          model_used?: string | null
          modules_array?: Database["public"]["Enums"]["module_code"][]
          pdf_url?: string | null
          ready_email_sent_at?: string | null
        }
        Update: {
          ai_content_json?: Json | null
          created_at?: string
          customer_id?: string
          download_token?: string
          generation_error?: string | null
          generation_status?: Database["public"]["Enums"]["report_generation_status"]
          id?: string
          intake_id?: string
          model_used?: string | null
          modules_array?: Database["public"]["Enums"]["module_code"][]
          pdf_url?: string | null
          ready_email_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_events: {
        Row: {
          created_at: string
          id: string
          processed_at: string | null
          stripe_event_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          processed_at?: string | null
          stripe_event_id: string
        }
        Update: {
          created_at?: string
          id?: string
          processed_at?: string | null
          stripe_event_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          status: string
          stripe_subscription_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          status?: string
          stripe_subscription_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          status?: string
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      generation_job_status: "queued" | "processing" | "complete" | "failed"
      module_code:
        | "CORE"
        | "LOVE"
        | "MONEY"
        | "BODY"
        | "YEAR"
        | "STYLE"
        | "PLACE"
        | "LOVE_TANDEM"
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "complete"
        | "failed_generation"
        | "refunded"
      report_generation_status:
        | "pending"
        | "processing"
        | "complete"
        | "failed_generation"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      generation_job_status: ["queued", "processing", "complete", "failed"],
      module_code: [
        "CORE",
        "LOVE",
        "MONEY",
        "BODY",
        "YEAR",
        "STYLE",
        "PLACE",
        "LOVE_TANDEM",
      ],
      order_status: [
        "pending",
        "paid",
        "processing",
        "complete",
        "failed_generation",
        "refunded",
      ],
      report_generation_status: [
        "pending",
        "processing",
        "complete",
        "failed_generation",
      ],
    },
  },
} as const
