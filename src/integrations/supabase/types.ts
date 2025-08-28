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
      early_adopters: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          availability: string | null
          bio: string | null
          completed_validations: number | null
          created_at: string | null
          expertise_areas: string[] | null
          hourly_rate: number | null
          id: string
          interests: string[] | null
          linkedin_url: string | null
          portfolio_url: string | null
          rating: number | null
          rejection_reason: string | null
          status: string | null
          total_points: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          availability?: string | null
          bio?: string | null
          completed_validations?: number | null
          created_at?: string | null
          expertise_areas?: string[] | null
          hourly_rate?: number | null
          id?: string
          interests?: string[] | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          rating?: number | null
          rejection_reason?: string | null
          status?: string | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          availability?: string | null
          bio?: string | null
          completed_validations?: number | null
          created_at?: string | null
          expertise_areas?: string[] | null
          hourly_rate?: number | null
          id?: string
          interests?: string[] | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          rating?: number | null
          rejection_reason?: string | null
          status?: string | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
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
      marketplace_analytics: {
        Row: {
          id: string
          metric_data: Json | null
          metric_name: string
          metric_value: number
          recorded_at: string | null
          validation_request_id: string | null
        }
        Insert: {
          id?: string
          metric_data?: Json | null
          metric_name: string
          metric_value: number
          recorded_at?: string | null
          validation_request_id?: string | null
        }
        Update: {
          id?: string
          metric_data?: Json | null
          metric_name?: string
          metric_value?: number
          recorded_at?: string | null
          validation_request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_analytics_validation_request_id_fkey"
            columns: ["validation_request_id"]
            isOneToOne: false
            referencedRelation: "validation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_rewards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          points_awarded: number
          reward_type: string
          user_id: string | null
          validation_response_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          points_awarded: number
          reward_type: string
          user_id?: string | null
          validation_response_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          points_awarded?: number
          reward_type?: string
          user_id?: string | null
          validation_response_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_rewards_validation_response_id_fkey"
            columns: ["validation_response_id"]
            isOneToOne: false
            referencedRelation: "validation_responses"
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
      validation_participants: {
        Row: {
          adopter_id: string | null
          completed_at: string | null
          id: string
          joined_at: string | null
          status: string | null
          validation_request_id: string | null
        }
        Insert: {
          adopter_id?: string | null
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          status?: string | null
          validation_request_id?: string | null
        }
        Update: {
          adopter_id?: string | null
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          status?: string | null
          validation_request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "validation_participants_validation_request_id_fkey"
            columns: ["validation_request_id"]
            isOneToOne: false
            referencedRelation: "validation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      validation_requests: {
        Row: {
          category: string
          created_at: string | null
          deadline: string | null
          description: string
          entrepreneur_id: string | null
          id: string
          idea_id: string | null
          max_responses: number | null
          requirements: string | null
          reward_points: number | null
          status: string | null
          target_audience: string
          title: string
          updated_at: string | null
          validation_type: string
        }
        Insert: {
          category: string
          created_at?: string | null
          deadline?: string | null
          description: string
          entrepreneur_id?: string | null
          id?: string
          idea_id?: string | null
          max_responses?: number | null
          requirements?: string | null
          reward_points?: number | null
          status?: string | null
          target_audience: string
          title: string
          updated_at?: string | null
          validation_type: string
        }
        Update: {
          category?: string
          created_at?: string | null
          deadline?: string | null
          description?: string
          entrepreneur_id?: string | null
          id?: string
          idea_id?: string | null
          max_responses?: number | null
          requirements?: string | null
          reward_points?: number | null
          status?: string | null
          target_audience?: string
          title?: string
          updated_at?: string | null
          validation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "validation_requests_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      validation_responses: {
        Row: {
          adopter_id: string | null
          approved_at: string | null
          created_at: string | null
          feedback: string | null
          id: string
          rating: number | null
          response_data: Json
          status: string | null
          time_spent_minutes: number | null
          validation_request_id: string | null
        }
        Insert: {
          adopter_id?: string | null
          approved_at?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          rating?: number | null
          response_data: Json
          status?: string | null
          time_spent_minutes?: number | null
          validation_request_id?: string | null
        }
        Update: {
          adopter_id?: string | null
          approved_at?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          rating?: number | null
          response_data?: Json
          status?: string | null
          time_spent_minutes?: number | null
          validation_request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "validation_responses_validation_request_id_fkey"
            columns: ["validation_request_id"]
            isOneToOne: false
            referencedRelation: "validation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_early_adopter: {
        Args: { admin_email: string; admin_user_id: string; adopter_id: string }
        Returns: undefined
      }
      award_marketplace_points: {
        Args: {
          description?: string
          points_amount: number
          reward_type?: string
          user_id: string
          validation_response_id?: string
        }
        Returns: undefined
      }
      calculate_adopter_rating: {
        Args: { adopter_user_id: string }
        Returns: number
      }
      deduct_credits_and_log: {
        Args: {
          p_amount: number
          p_description?: string
          p_feature: string
          p_item_id?: string
          p_user_id: string
        }
        Returns: number
      }
      get_marketplace_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
      is_first_analysis: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      reject_early_adopter: {
        Args: {
          admin_email: string
          admin_user_id: string
          adopter_id: string
          reason?: string
        }
        Returns: undefined
      }
      update_user_credits: {
        Args: { amount: number; user_id: string }
        Returns: undefined
      }
      update_validation_count: {
        Args: { adopter_user_id: string }
        Returns: undefined
      }
      use_credits_for_feature: {
        Args: {
          amount_param: number
          description_param: string
          feature_param: string
          item_id_param?: string
          user_id_param: string
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
