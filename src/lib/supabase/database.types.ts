export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      affiliate_clicks: {
        Row: {
          created_at: string
          id: string
          product_id: string
          referrer: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          referrer?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          referrer?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_clicks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_imports: {
        Row: {
          admin_id: string | null
          created_at: string
          errors: Json
          filename: string
          id: string
          rows_error: number
          rows_ok: number
          rows_total: number
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          errors?: Json
          filename: string
          id?: string
          rows_error?: number
          rows_ok?: number
          rows_total?: number
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          errors?: Json
          filename?: string
          id?: string
          rows_error?: number
          rows_ok?: number
          rows_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "catalog_imports_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          created_at: string
          delta: number
          id: string
          reason: Database["public"]["Enums"]["credit_reason"]
          ref_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          reason: Database["public"]["Enums"]["credit_reason"]
          ref_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          reason?: Database["public"]["Enums"]["credit_reason"]
          ref_id?: string | null
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
      products: {
        Row: {
          affiliate_url: string
          brand: string
          care: string | null
          category: string
          color: string | null
          created_at: string
          currency: string
          description: string | null
          external_id: string
          gender: Database["public"]["Enums"]["product_gender"]
          id: string
          image_path: string | null
          image_source_url: string | null
          is_active: boolean
          is_new: boolean
          is_popular: boolean
          made_in: string | null
          merchant: string
          name: string
          price: number
          size_advice: string | null
          sizes: string[]
          slug: string
          updated_at: string
        }
        Insert: {
          affiliate_url: string
          brand: string
          care?: string | null
          category: string
          color?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          external_id: string
          gender?: Database["public"]["Enums"]["product_gender"]
          id?: string
          image_path?: string | null
          image_source_url?: string | null
          is_active?: boolean
          is_new?: boolean
          is_popular?: boolean
          made_in?: string | null
          merchant: string
          name: string
          price: number
          size_advice?: string | null
          sizes?: string[]
          slug: string
          updated_at?: string
        }
        Update: {
          affiliate_url?: string
          brand?: string
          care?: string | null
          category?: string
          color?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          external_id?: string
          gender?: Database["public"]["Enums"]["product_gender"]
          id?: string
          image_path?: string | null
          image_source_url?: string | null
          is_active?: boolean
          is_new?: boolean
          is_popular?: boolean
          made_in?: string | null
          merchant?: string
          name?: string
          price?: number
          size_advice?: string | null
          sizes?: string[]
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          credits_balance: number
          email: string | null
          id: string
          onboarding_seen: boolean
          photo_consent_at: string | null
          reference_photo_path: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits_balance?: number
          email?: string | null
          id: string
          onboarding_seen?: boolean
          photo_consent_at?: string | null
          reference_photo_path?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits_balance?: number
          email?: string | null
          id?: string
          onboarding_seen?: boolean
          photo_consent_at?: string | null
          reference_photo_path?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          id: string
          processed_at: string
          type: string
        }
        Insert: {
          id: string
          processed_at?: string
          type: string
        }
        Update: {
          id?: string
          processed_at?: string
          type?: string
        }
        Relationships: []
      }
      tryons: {
        Row: {
          attempt: number
          completed_at: string | null
          created_at: string
          error: string | null
          id: string
          product_id: string
          provider: string | null
          result_path: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["tryon_status"]
          user_id: string
        }
        Insert: {
          attempt?: number
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          product_id: string
          provider?: string | null
          result_path?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["tryon_status"]
          user_id: string
        }
        Update: {
          attempt?: number
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          product_id?: string
          provider?: string | null
          result_path?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["tryon_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tryons_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tryons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wardrobe_items: {
        Row: {
          brand: string | null
          category: string
          color: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["wardrobe_kind"]
          photo_path: string | null
          product_id: string | null
          tryon_id: string | null
          user_id: string
        }
        Insert: {
          brand?: string | null
          category: string
          color?: string | null
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["wardrobe_kind"]
          photo_path?: string | null
          product_id?: string | null
          tryon_id?: string | null
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: string
          color?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["wardrobe_kind"]
          photo_path?: string | null
          product_id?: string | null
          tryon_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wardrobe_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wardrobe_items_tryon_id_fkey"
            columns: ["tryon_id"]
            isOneToOne: false
            referencedRelation: "tryons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wardrobe_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fail_tryon: {
        Args: { p_error: string; p_tryon_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      start_tryon: {
        Args: { p_product_id: string }
        Returns: {
          attempt: number
          completed_at: string | null
          created_at: string
          error: string | null
          id: string
          product_id: string
          provider: string | null
          result_path: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["tryon_status"]
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "tryons"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      credit_reason:
        | "signup_bonus"
        | "tryon"
        | "refund"
        | "purchase"
        | "admin_adjustment"
      product_gender: "Femme" | "Homme" | "Unisexe"
      tryon_status: "queued" | "processing" | "succeeded" | "failed"
      user_role: "user" | "admin"
      wardrobe_kind: "tryon" | "owned"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      credit_reason: [
        "signup_bonus",
        "tryon",
        "refund",
        "purchase",
        "admin_adjustment",
      ],
      product_gender: ["Femme", "Homme", "Unisexe"],
      tryon_status: ["queued", "processing", "succeeded", "failed"],
      user_role: ["user", "admin"],
      wardrobe_kind: ["tryon", "owned"],
    },
  },
} as const

