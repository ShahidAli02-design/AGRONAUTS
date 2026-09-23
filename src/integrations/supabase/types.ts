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
      batch_events: {
        Row: {
          actor_id: string | null
          batch_id: string
          created_at: string
          description: string
          event_type: string
          id: string
          metadata: Json
        }
        Insert: {
          actor_id?: string | null
          batch_id: string
          created_at?: string
          description: string
          event_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          actor_id?: string | null
          batch_id?: string
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "batch_events_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          batch_code: string
          created_at: string
          crop: string
          demo_farmer_name: string | null
          district: string
          farmer_id: string | null
          grade: string | null
          grade_reason: string | null
          grade_score: number | null
          grade_source: string | null
          harvest_date: string
          id: string
          is_demo: boolean
          notes: string | null
          photo_url: string | null
          quantity_kg: number
          status: Database["public"]["Enums"]["batch_status"]
          storage_location: string | null
          updated_at: string
          utilization: string | null
          variety: string | null
          village: string | null
        }
        Insert: {
          batch_code: string
          created_at?: string
          crop: string
          demo_farmer_name?: string | null
          district: string
          farmer_id?: string | null
          grade?: string | null
          grade_reason?: string | null
          grade_score?: number | null
          grade_source?: string | null
          harvest_date: string
          id?: string
          is_demo?: boolean
          notes?: string | null
          photo_url?: string | null
          quantity_kg: number
          status?: Database["public"]["Enums"]["batch_status"]
          storage_location?: string | null
          updated_at?: string
          utilization?: string | null
          variety?: string | null
          village?: string | null
        }
        Update: {
          batch_code?: string
          created_at?: string
          crop?: string
          demo_farmer_name?: string | null
          district?: string
          farmer_id?: string | null
          grade?: string | null
          grade_reason?: string | null
          grade_score?: number | null
          grade_source?: string | null
          harvest_date?: string
          id?: string
          is_demo?: boolean
          notes?: string | null
          photo_url?: string | null
          quantity_kg?: number
          status?: Database["public"]["Enums"]["batch_status"]
          storage_location?: string | null
          updated_at?: string
          utilization?: string | null
          variety?: string | null
          village?: string | null
        }
        Relationships: []
      }
      listings: {
        Row: {
          batch_id: string
          created_at: string
          farmer_id: string | null
          id: string
          is_demo: boolean
          price_per_kg: number
          quantity_kg: number
          status: string
          updated_at: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          farmer_id?: string | null
          id?: string
          is_demo?: boolean
          price_per_kg: number
          quantity_kg: number
          status?: string
          updated_at?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          farmer_id?: string | null
          id?: string
          is_demo?: boolean
          price_per_kg?: number
          quantity_kg?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          batch_id: string
          buyer_id: string
          created_at: string
          delivery_address: string | null
          farmer_id: string | null
          id: string
          listing_id: string
          price_per_kg: number
          quantity_kg: number
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          batch_id: string
          buyer_id: string
          created_at?: string
          delivery_address?: string | null
          farmer_id?: string | null
          id?: string
          listing_id: string
          price_per_kg: number
          quantity_kg: number
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          batch_id?: string
          buyer_id?: string
          created_at?: string
          delivery_address?: string | null
          farmer_id?: string | null
          id?: string
          listing_id?: string
          price_per_kg?: number
          quantity_kg?: number
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          district: string | null
          full_name: string
          id: string
          language: string
          phone: string | null
          updated_at: string
          village: string | null
        }
        Insert: {
          created_at?: string
          district?: string | null
          full_name?: string
          id: string
          language?: string
          phone?: string | null
          updated_at?: string
          village?: string | null
        }
        Update: {
          created_at?: string
          district?: string | null
          full_name?: string
          id?: string
          language?: string
          phone?: string | null
          updated_at?: string
          village?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "farmer" | "buyer" | "processor" | "admin"
      batch_status:
        | "harvested"
        | "graded"
        | "stored"
        | "listed"
        | "sold"
        | "delivered"
      order_status:
        | "placed"
        | "confirmed"
        | "in_transit"
        | "delivered"
        | "cancelled"
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
    Enums: {
      app_role: ["farmer", "buyer", "processor", "admin"],
      batch_status: [
        "harvested",
        "graded",
        "stored",
        "listed",
        "sold",
        "delivered",
      ],
      order_status: [
        "placed",
        "confirmed",
        "in_transit",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
