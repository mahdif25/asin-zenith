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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      api_requests: {
        Row: {
          created_at: string
          data_used: number | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          keyword: string | null
          marketplace: Database["public"]["Enums"]["marketplace_type"]
          response_time_ms: number | null
          success: boolean
          tracking_job_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data_used?: number | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          keyword?: string | null
          marketplace: Database["public"]["Enums"]["marketplace_type"]
          response_time_ms?: number | null
          success?: boolean
          tracking_job_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          data_used?: number | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          keyword?: string | null
          marketplace?: Database["public"]["Enums"]["marketplace_type"]
          response_time_ms?: number | null
          success?: boolean
          tracking_job_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_requests_tracking_job_id_fkey"
            columns: ["tracking_job_id"]
            isOneToOne: false
            referencedRelation: "tracking_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      data_usage_settings: {
        Row: {
          created_at: string
          id: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      position_history: {
        Row: {
          competition_level: string | null
          created_at: string
          id: string
          keyword: string
          organic_position: number | null
          search_volume: number | null
          sponsored_position: number | null
          tracked_at: string
          tracking_job_id: string
        }
        Insert: {
          competition_level?: string | null
          created_at?: string
          id?: string
          keyword: string
          organic_position?: number | null
          search_volume?: number | null
          sponsored_position?: number | null
          tracked_at?: string
          tracking_job_id: string
        }
        Update: {
          competition_level?: string | null
          created_at?: string
          id?: string
          keyword?: string
          organic_position?: number | null
          search_volume?: number | null
          sponsored_position?: number | null
          tracked_at?: string
          tracking_job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "position_history_tracking_job_id_fkey"
            columns: ["tracking_job_id"]
            isOneToOne: false
            referencedRelation: "tracking_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      proxy_configurations: {
        Row: {
          configuration: Json
          created_at: string
          id: string
          last_test_result: Json | null
          metrics: Json | null
          provider_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          id?: string
          last_test_result?: Json | null
          metrics?: Json | null
          provider_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          id?: string
          last_test_result?: Json | null
          metrics?: Json | null
          provider_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tracking_jobs: {
        Row: {
          asin: string
          created_at: string
          id: string
          keywords: string[]
          last_tracked_at: string | null
          marketplace: Database["public"]["Enums"]["marketplace_type"]
          next_tracking_at: string | null
          random_delay_max: number | null
          random_delay_min: number | null
          status: Database["public"]["Enums"]["tracking_status"]
          tracking_frequency: Database["public"]["Enums"]["tracking_frequency"]
          updated_at: string
          user_id: string
        }
        Insert: {
          asin: string
          created_at?: string
          id?: string
          keywords: string[]
          last_tracked_at?: string | null
          marketplace?: Database["public"]["Enums"]["marketplace_type"]
          next_tracking_at?: string | null
          random_delay_max?: number | null
          random_delay_min?: number | null
          status?: Database["public"]["Enums"]["tracking_status"]
          tracking_frequency?: Database["public"]["Enums"]["tracking_frequency"]
          updated_at?: string
          user_id: string
        }
        Update: {
          asin?: string
          created_at?: string
          id?: string
          keywords?: string[]
          last_tracked_at?: string | null
          marketplace?: Database["public"]["Enums"]["marketplace_type"]
          next_tracking_at?: string | null
          random_delay_max?: number | null
          random_delay_min?: number | null
          status?: Database["public"]["Enums"]["tracking_status"]
          tracking_frequency?: Database["public"]["Enums"]["tracking_frequency"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tracking_schedules: {
        Row: {
          created_at: string
          executed_at: string | null
          id: string
          scheduled_at: string
          status: Database["public"]["Enums"]["tracking_status"]
          tracking_job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          executed_at?: string | null
          id?: string
          scheduled_at: string
          status?: Database["public"]["Enums"]["tracking_status"]
          tracking_job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          executed_at?: string | null
          id?: string
          scheduled_at?: string
          status?: Database["public"]["Enums"]["tracking_status"]
          tracking_job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_schedules_tracking_job_id_fkey"
            columns: ["tracking_job_id"]
            isOneToOne: false
            referencedRelation: "tracking_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          company_name: string | null
          created_at: string
          daily_api_limit: number | null
          email: string
          full_name: string | null
          id: string
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          daily_api_limit?: number | null
          email: string
          full_name?: string | null
          id: string
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          daily_api_limit?: number | null
          email?: string
          full_name?: string | null
          id?: string
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      marketplace_type:
        | "US"
        | "UK"
        | "DE"
        | "FR"
        | "IT"
        | "ES"
        | "CA"
        | "JP"
        | "AU"
        | "IN"
        | "MX"
        | "BR"
      tracking_frequency: "hourly" | "every_6_hours" | "daily" | "weekly"
      tracking_status: "active" | "paused" | "completed" | "failed"
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
      marketplace_type: [
        "US",
        "UK",
        "DE",
        "FR",
        "IT",
        "ES",
        "CA",
        "JP",
        "AU",
        "IN",
        "MX",
        "BR",
      ],
      tracking_frequency: ["hourly", "every_6_hours", "daily", "weekly"],
      tracking_status: ["active", "paused", "completed", "failed"],
    },
  },
} as const
