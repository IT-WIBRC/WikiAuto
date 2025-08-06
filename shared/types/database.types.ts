export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)";
  };
  public: {
    Tables: {
      badges: {
        Row: {
          badge_id: string;
          created_at: string | null;
          description: string | null;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          badge_id?: string;
          created_at?: string | null;
          description?: string | null;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          badge_id?: string;
          created_at?: string | null;
          description?: string | null;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      content_badges: {
        Row: {
          badge_id: string;
          content_id: string;
        };
        Insert: {
          badge_id: string;
          content_id: string;
        };
        Update: {
          badge_id?: string;
          content_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_badges_badge_id_fkey";
            columns: ["badge_id"];
            isOneToOne: false;
            referencedRelation: "badges";
            referencedColumns: ["badge_id"];
          },
          {
            foreignKeyName: "content_badges_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: false;
            referencedRelation: "contents";
            referencedColumns: ["content_id"];
          },
        ];
      };
      content_dislikes: {
        Row: {
          content_id: string;
          dislike_at: string;
          dislike_id: string;
        };
        Insert: {
          content_id: string;
          dislike_at?: string;
          dislike_id?: string;
        };
        Update: {
          content_id?: string;
          dislike_at?: string;
          dislike_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_dislikes_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: false;
            referencedRelation: "contents";
            referencedColumns: ["content_id"];
          },
        ];
      };
      content_likes: {
        Row: {
          content_id: string;
          like_at: string;
          like_id: string;
        };
        Insert: {
          content_id: string;
          like_at?: string;
          like_id?: string;
        };
        Update: {
          content_id?: string;
          like_at?: string;
          like_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_likes_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: false;
            referencedRelation: "contents";
            referencedColumns: ["content_id"];
          },
        ];
      };
      contents: {
        Row: {
          content_id: string;
          created_at: string;
          explanation: string | null;
          image: string;
          status: string;
          title: string;
          updated_at: string | null;
          user_email: string;
        };
        Insert: {
          content_id?: string;
          created_at?: string;
          explanation?: string | null;
          image: string;
          status: string;
          title: string;
          updated_at?: string | null;
          user_email: string;
        };
        Update: {
          content_id?: string;
          created_at?: string;
          explanation?: string | null;
          image?: string;
          status?: string;
          title?: string;
          updated_at?: string | null;
          user_email?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contents_user_email_fkey";
            columns: ["user_email"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["email"];
          },
        ];
      };
      profile: {
        Row: {
          created_at: string | null;
          email: string;
          firstname: string | null;
          lastname: string | null;
          user_id: string;
          username: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          firstname?: string | null;
          lastname?: string | null;
          user_id?: string;
          username?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          firstname?: string | null;
          lastname?: string | null;
          user_id?: string;
          username?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_profile: {
        Args:
          | { user_id: number; email: string }
          | { user_id: number; username: string; bio: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
