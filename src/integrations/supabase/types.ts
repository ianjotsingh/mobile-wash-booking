export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          address: string
          city: string
          company_name: string
          created_at: string | null
          description: string | null
          email: string
          experience: string | null
          has_mechanic: boolean | null
          id: string
          latitude: number | null
          longitude: number | null
          owner_name: string
          phone: string
          services: string[] | null
          status: Database["public"]["Enums"]["company_status"] | null
          updated_at: string | null
          user_id: string | null
          zip_code: string
        }
        Insert: {
          address: string
          city: string
          company_name: string
          created_at?: string | null
          description?: string | null
          email: string
          experience?: string | null
          has_mechanic?: boolean | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          owner_name: string
          phone: string
          services?: string[] | null
          status?: Database["public"]["Enums"]["company_status"] | null
          updated_at?: string | null
          user_id?: string | null
          zip_code: string
        }
        Update: {
          address?: string
          city?: string
          company_name?: string
          created_at?: string | null
          description?: string | null
          email?: string
          experience?: string | null
          has_mechanic?: boolean | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          owner_name?: string
          phone?: string
          services?: string[] | null
          status?: Database["public"]["Enums"]["company_status"] | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      company_service_pricing: {
        Row: {
          base_price: number
          company_id: string
          created_at: string | null
          id: string
          is_available: boolean | null
          service_id: string
          service_name: string
          updated_at: string | null
        }
        Insert: {
          base_price: number
          company_id: string
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          service_id: string
          service_name: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          company_id?: string
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          service_id?: string
          service_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_service_pricing_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      mechanic_requests: {
        Row: {
          address: string
          assigned_mechanic_id: string | null
          car_model: string
          city: string
          created_at: string
          customer_phone_shared: boolean | null
          id: string
          mechanic_phone_shared: boolean | null
          phone: string
          problem_description: string
          status: string
          updated_at: string
          user_id: string | null
          zip_code: string
        }
        Insert: {
          address: string
          assigned_mechanic_id?: string | null
          car_model: string
          city: string
          created_at?: string
          customer_phone_shared?: boolean | null
          id?: string
          mechanic_phone_shared?: boolean | null
          phone: string
          problem_description: string
          status?: string
          updated_at?: string
          user_id?: string | null
          zip_code: string
        }
        Update: {
          address?: string
          assigned_mechanic_id?: string | null
          car_model?: string
          city?: string
          created_at?: string
          customer_phone_shared?: boolean | null
          id?: string
          mechanic_phone_shared?: boolean | null
          phone?: string
          problem_description?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "mechanic_requests_assigned_mechanic_id_fkey"
            columns: ["assigned_mechanic_id"]
            isOneToOne: false
            referencedRelation: "mechanics"
            referencedColumns: ["id"]
          },
        ]
      }
      mechanics: {
        Row: {
          address: string
          availability_hours: string | null
          city: string
          created_at: string | null
          description: string | null
          email: string
          experience: string | null
          full_name: string
          hourly_rate: number | null
          id: string
          latitude: number | null
          longitude: number | null
          phone: string
          specializations: string[] | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          zip_code: string
        }
        Insert: {
          address: string
          availability_hours?: string | null
          city: string
          created_at?: string | null
          description?: string | null
          email: string
          experience?: string | null
          full_name: string
          hourly_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          phone: string
          specializations?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip_code: string
        }
        Update: {
          address?: string
          availability_hours?: string | null
          city?: string
          created_at?: string | null
          description?: string | null
          email?: string
          experience?: string | null
          full_name?: string
          hourly_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string
          specializations?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          order_id: string | null
          quote_id: string | null
          title: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          order_id?: string | null
          quote_id?: string | null
          title: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          order_id?: string | null
          quote_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "order_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      order_quotes: {
        Row: {
          additional_notes: string | null
          company_id: string
          created_at: string
          estimated_duration: number | null
          id: string
          order_id: string
          quoted_price: number
          status: string
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          company_id: string
          created_at?: string
          estimated_duration?: number | null
          id?: string
          order_id: string
          quoted_price: number
          status?: string
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          company_id?: string
          created_at?: string
          estimated_duration?: number | null
          id?: string
          order_id?: string
          quoted_price?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_quotes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_quotes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          booking_date: string
          booking_time: string
          car_color: string
          car_model: string
          car_type: string
          city: string
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          service_type: string
          special_instructions: string | null
          status: string
          total_amount: number
          user_id: string
          zip_code: string
        }
        Insert: {
          address: string
          booking_date: string
          booking_time: string
          car_color: string
          car_model: string
          car_type: string
          city: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          service_type: string
          special_instructions?: string | null
          status?: string
          total_amount: number
          user_id: string
          zip_code: string
        }
        Update: {
          address?: string
          booking_date?: string
          booking_time?: string
          car_color?: string
          car_model?: string
          car_type?: string
          city?: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          service_type?: string
          special_instructions?: string | null
          status?: string
          total_amount?: number
          user_id?: string
          zip_code?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          description: string
          duration: number
          features: string[] | null
          id: string
          name: string
          popular: boolean | null
        }
        Insert: {
          created_at?: string | null
          description: string
          duration: number
          features?: string[] | null
          id?: string
          name: string
          popular?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string
          duration?: number
          features?: string[] | null
          id?: string
          name?: string
          popular?: boolean | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          phone_verified: boolean | null
          phone_verified_at: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          phone_verified?: boolean | null
          phone_verified_at?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          phone_verified?: boolean | null
          phone_verified_at?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lon1: number; lat2: number; lon2: number }
        Returns: number
      }
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      company_status: "pending" | "approved" | "rejected"
      user_role: "customer" | "company" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      company_status: ["pending", "approved", "rejected"],
      user_role: ["customer", "company", "admin"],
    },
  },
} as const
