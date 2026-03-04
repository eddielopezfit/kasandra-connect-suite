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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      decision_receipts: {
        Row: {
          created_at: string
          id: string
          language: string
          lead_id: string | null
          receipt_data: Json
          receipt_type: string
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          lead_id?: string | null
          receipt_data?: Json
          receipt_type?: string
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          lead_id?: string | null
          receipt_data?: Json
          receipt_type?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_log: {
        Row: {
          created_at: string
          event_payload: Json | null
          event_type: string
          id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          event_payload?: Json | null
          event_type: string
          id?: string
          session_id: string
        }
        Update: {
          created_at?: string
          event_payload?: Json | null
          event_type?: string
          id?: string
          session_id?: string
        }
        Relationships: []
      }
      lead_handoffs: {
        Row: {
          booking_url: string | null
          calendar_event_id: string | null
          channel: string
          contact_pref: string | null
          convo_summary_json: Json | null
          created_at: string
          id: string
          lead_id: string
          notification_id: string | null
          notification_provider: string | null
          notified_at: string | null
          priority: string
          reason: string | null
          recommended_next_step: string | null
          requested_slot_label: string | null
          requested_slot_start: string | null
          status: string
          summary_md: string
        }
        Insert: {
          booking_url?: string | null
          calendar_event_id?: string | null
          channel: string
          contact_pref?: string | null
          convo_summary_json?: Json | null
          created_at?: string
          id?: string
          lead_id: string
          notification_id?: string | null
          notification_provider?: string | null
          notified_at?: string | null
          priority: string
          reason?: string | null
          recommended_next_step?: string | null
          requested_slot_label?: string | null
          requested_slot_start?: string | null
          status?: string
          summary_md: string
        }
        Update: {
          booking_url?: string | null
          calendar_event_id?: string | null
          channel?: string
          contact_pref?: string | null
          convo_summary_json?: Json | null
          created_at?: string
          id?: string
          lead_id?: string
          notification_id?: string | null
          notification_provider?: string | null
          notified_at?: string | null
          priority?: string
          reason?: string | null
          recommended_next_step?: string | null
          requested_slot_label?: string | null
          requested_slot_start?: string | null
          status?: string
          summary_md?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_handoffs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_profiles: {
        Row: {
          condition: string | null
          created_at: string
          email: string
          email_verified: boolean | null
          ghl_contact_id: string | null
          ghl_synced_at: string | null
          id: string
          intent: string | null
          language: string | null
          lead_grade: string | null
          lead_score: number | null
          name: string | null
          phone: string | null
          phone_verified: boolean | null
          session_id: string | null
          situation: string | null
          source: string | null
          tags: string[] | null
          timeline: string | null
          updated_at: string
          utm_campaign: string | null
          utm_source: string | null
          verification_expires_at: string | null
          verification_token: string | null
        }
        Insert: {
          condition?: string | null
          created_at?: string
          email: string
          email_verified?: boolean | null
          ghl_contact_id?: string | null
          ghl_synced_at?: string | null
          id?: string
          intent?: string | null
          language?: string | null
          lead_grade?: string | null
          lead_score?: number | null
          name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          session_id?: string | null
          situation?: string | null
          source?: string | null
          tags?: string[] | null
          timeline?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_source?: string | null
          verification_expires_at?: string | null
          verification_token?: string | null
        }
        Update: {
          condition?: string | null
          created_at?: string
          email?: string
          email_verified?: boolean | null
          ghl_contact_id?: string | null
          ghl_synced_at?: string | null
          id?: string
          intent?: string | null
          language?: string | null
          lead_grade?: string | null
          lead_score?: number | null
          name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          session_id?: string | null
          situation?: string | null
          source?: string | null
          tags?: string[] | null
          timeline?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_source?: string | null
          verification_expires_at?: string | null
          verification_token?: string | null
        }
        Relationships: []
      }
      lead_reports: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          report_content: Json | null
          report_markdown: string | null
          report_type: string
          requires_verification: boolean | null
          unlocked_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          report_content?: Json | null
          report_markdown?: string | null
          report_type: string
          requires_verification?: boolean | null
          unlocked_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          report_content?: Json | null
          report_markdown?: string | null
          report_type?: string
          requires_verification?: boolean | null
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_reports_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      neighborhood_profiles: {
        Row: {
          created_at: string
          generated_at: string
          id: string
          profile_en: Json
          profile_es: Json
          profile_hash: string | null
          zip_code: string
        }
        Insert: {
          created_at?: string
          generated_at?: string
          id?: string
          profile_en: Json
          profile_es: Json
          profile_hash?: string | null
          zip_code: string
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: string
          profile_en?: Json
          profile_es?: Json
          profile_hash?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          endpoint: string
          id: string
          key: string
          request_count: number
          window_start: string
        }
        Insert: {
          endpoint: string
          id?: string
          key: string
          request_count?: number
          window_start?: string
        }
        Update: {
          endpoint?: string
          id?: string
          key?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      saved_scenarios: {
        Row: {
          created_at: string
          estimated_value: number | null
          id: string
          is_monitoring: boolean | null
          lead_id: string | null
          mortgage_balance: number | null
          results_json: Json
          scenario_type: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          created_at?: string
          estimated_value?: number | null
          id?: string
          is_monitoring?: boolean | null
          lead_id?: string | null
          mortgage_balance?: number | null
          results_json: Json
          scenario_type?: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          created_at?: string
          estimated_value?: number | null
          id?: string
          is_monitoring?: boolean | null
          lead_id?: string | null
          mortgage_balance?: number | null
          results_json?: Json
          scenario_type?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_scenarios_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_leads: {
        Row: {
          calculated_cash_offer: number | null
          calculated_listing_net: number | null
          condition: string | null
          created_at: string
          email: string
          estimated_value: string | null
          id: string
          name: string
          property_address: string | null
          situation: string | null
          source: string | null
          timeline: string | null
        }
        Insert: {
          calculated_cash_offer?: number | null
          calculated_listing_net?: number | null
          condition?: string | null
          created_at?: string
          email: string
          estimated_value?: string | null
          id?: string
          name: string
          property_address?: string | null
          situation?: string | null
          source?: string | null
          timeline?: string | null
        }
        Update: {
          calculated_cash_offer?: number | null
          calculated_listing_net?: number | null
          condition?: string | null
          created_at?: string
          email?: string
          estimated_value?: string | null
          id?: string
          name?: string
          property_address?: string | null
          situation?: string | null
          source?: string | null
          timeline?: string | null
        }
        Relationships: []
      }
      session_snapshots: {
        Row: {
          calculator_data: Json | null
          context_json: Json | null
          created_at: string | null
          guides_read: string[] | null
          id: string
          intent: string | null
          last_page: string | null
          lead_id: string | null
          primary_priority: string | null
          readiness_score: number | null
          session_id: string
          tools_used: string[] | null
          updated_at: string | null
        }
        Insert: {
          calculator_data?: Json | null
          context_json?: Json | null
          created_at?: string | null
          guides_read?: string[] | null
          id?: string
          intent?: string | null
          last_page?: string | null
          lead_id?: string | null
          primary_priority?: string | null
          readiness_score?: number | null
          session_id: string
          tools_used?: string[] | null
          updated_at?: string | null
        }
        Update: {
          calculator_data?: Json | null
          context_json?: Json | null
          created_at?: string | null
          guides_read?: string[] | null
          id?: string
          intent?: string | null
          last_page?: string | null
          lead_id?: string | null
          primary_priority?: string | null
          readiness_score?: number | null
          session_id?: string
          tools_used?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_rate_limits: { Args: never; Returns: undefined }
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
    Enums: {},
  },
} as const
