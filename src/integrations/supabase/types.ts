export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      advanced_analyses: {
        Row: {
          analysis_data: Json
          created_at: string
          id: string
          idea_id: string
          user_id: string
        }
        Insert: {
          analysis_data: Json
          created_at?: string
          id?: string
          idea_id: string
          user_id: string
        }
        Update: {
          analysis_data?: Json
          created_at?: string
          id?: string
          idea_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advanced_analyses_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          idea_id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          idea_id: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          idea_id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          feature: string | null
          id: string
          item_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          feature?: string | null
          id?: string
          item_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          feature?: string | null
          id?: string
          item_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_insights: {
        Row: {
          created_at: string
          generated_date: string
          id: string
          insight_data: Json
          insight_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generated_date?: string
          id?: string
          insight_data: Json
          insight_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          generated_date?: string
          id?: string
          insight_data?: Json
          insight_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_content: {
        Row: {
          content_data: Json
          content_type: string
          created_at: string
          file_url: string | null
          id: string
          idea_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_data: Json
          content_type: string
          created_at?: string
          file_url?: string | null
          id?: string
          idea_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_data?: Json
          content_type?: string
          created_at?: string
          file_url?: string | null
          id?: string
          idea_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_content_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_analyses: {
        Row: {
          ai_insights: Json | null
          competitor_analysis: Json | null
          created_at: string
          differentiation: string | null
          financial_analysis: Json | null
          id: string
          idea_id: string
          last_insight_generation: string | null
          market_analysis: Json | null
          market_size: string | null
          recommendations: Json | null
          score: number
          status: string
          strengths: string[] | null
          swot_analysis: Json | null
          user_id: string
          weaknesses: string[] | null
        }
        Insert: {
          ai_insights?: Json | null
          competitor_analysis?: Json | null
          created_at?: string
          differentiation?: string | null
          financial_analysis?: Json | null
          id?: string
          idea_id: string
          last_insight_generation?: string | null
          market_analysis?: Json | null
          market_size?: string | null
          recommendations?: Json | null
          score: number
          status: string
          strengths?: string[] | null
          swot_analysis?: Json | null
          user_id: string
          weaknesses?: string[] | null
        }
        Update: {
          ai_insights?: Json | null
          competitor_analysis?: Json | null
          created_at?: string
          differentiation?: string | null
          financial_analysis?: Json | null
          id?: string
          idea_id?: string
          last_insight_generation?: string | null
          market_analysis?: Json | null
          market_size?: string | null
          recommendations?: Json | null
          score?: number
          status?: string
          strengths?: string[] | null
          swot_analysis?: Json | null
          user_id?: string
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "idea_analyses_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_comparisons: {
        Row: {
          comparison_insights: Json | null
          created_at: string
          id: string
          idea_ids: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          comparison_insights?: Json | null
          created_at?: string
          id?: string
          idea_ids: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          comparison_insights?: Json | null
          created_at?: string
          id?: string
          idea_ids?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      idea_favorites: {
        Row: {
          created_at: string
          id: string
          idea_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          idea_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_favorites_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_tags: {
        Row: {
          created_at: string
          id: string
          idea_id: string
          tag_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea_id: string
          tag_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          idea_id?: string
          tag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_tags_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          audience: string | null
          budget: number | null
          created_at: string
          description: string
          generated_name: string | null
          has_competitors: string | null
          id: string
          is_draft: boolean
          location: string | null
          monetization: string | null
          problem: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audience?: string | null
          budget?: number | null
          created_at?: string
          description: string
          generated_name?: string | null
          has_competitors?: string | null
          id?: string
          is_draft?: boolean
          location?: string | null
          monetization?: string | null
          problem?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audience?: string | null
          budget?: number | null
          created_at?: string
          description?: string
          generated_name?: string | null
          has_competitors?: string | null
          id?: string
          is_draft?: boolean
          location?: string | null
          monetization?: string | null
          problem?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_alerts: boolean | null
          area: string | null
          bio: string | null
          birthdate: string | null
          city: string | null
          company: string | null
          contact_pref: string | null
          created_at: string
          credits: number
          display_name: string | null
          email: string
          email_notifications: boolean | null
          first_analysis_done: boolean | null
          id: string
          linkedin: string | null
          marketing_emails: boolean | null
          name: string
          new_features: boolean | null
          phone: string | null
          photo_url: string | null
          plan: string
          surname: string | null
          tips: boolean | null
        }
        Insert: {
          account_alerts?: boolean | null
          area?: string | null
          bio?: string | null
          birthdate?: string | null
          city?: string | null
          company?: string | null
          contact_pref?: string | null
          created_at?: string
          credits?: number
          display_name?: string | null
          email: string
          email_notifications?: boolean | null
          first_analysis_done?: boolean | null
          id: string
          linkedin?: string | null
          marketing_emails?: boolean | null
          name: string
          new_features?: boolean | null
          phone?: string | null
          photo_url?: string | null
          plan?: string
          surname?: string | null
          tips?: boolean | null
        }
        Update: {
          account_alerts?: boolean | null
          area?: string | null
          bio?: string | null
          birthdate?: string | null
          city?: string | null
          company?: string | null
          contact_pref?: string | null
          created_at?: string
          credits?: number
          display_name?: string | null
          email?: string
          email_notifications?: boolean | null
          first_analysis_done?: boolean | null
          id?: string
          linkedin?: string | null
          marketing_emails?: boolean | null
          name?: string
          new_features?: boolean | null
          phone?: string | null
          photo_url?: string | null
          plan?: string
          surname?: string | null
          tips?: boolean | null
        }
        Relationships: []
      }
      saved_analyses: {
        Row: {
          analysis_data: Json
          created_at: string
          id: string
          idea_id: string
          idea_title: string
          original_analysis_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_data: Json
          created_at?: string
          id?: string
          idea_id: string
          idea_title: string
          original_analysis_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_data?: Json
          created_at?: string
          id?: string
          idea_id?: string
          idea_title?: string
          original_analysis_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          created_at: string
          description: string
          earned_at: string
          icon: string
          id: string
          points_awarded: number
          user_id: string
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          created_at?: string
          description: string
          earned_at?: string
          icon?: string
          id?: string
          points_awarded?: number
          user_id: string
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          created_at?: string
          description?: string
          earned_at?: string
          icon?: string
          id?: string
          points_awarded?: number
          user_id?: string
        }
        Relationships: []
      }
      user_levels: {
        Row: {
          created_at: string
          current_level: number
          id: string
          level_name: string
          points_to_next_level: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          id?: string
          level_name?: string
          points_to_next_level?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          id?: string
          level_name?: string
          points_to_next_level?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deduct_credits_and_log: {
        Args: {
          p_user_id: string
          p_amount: number
          p_feature: string
          p_item_id?: string
          p_description?: string
        }
        Returns: number
      }
      is_first_analysis: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      update_user_credits: {
        Args: { user_id: string; amount: number }
        Returns: undefined
      }
      use_credits_for_feature: {
        Args: {
          user_id_param: string
          amount_param: number
          description_param: string
          feature_param: string
          item_id_param?: string
        }
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
