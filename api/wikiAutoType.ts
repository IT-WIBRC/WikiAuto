export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      badges: {
        Row: {
          badge_id: string;
          description: string | null;
          name: string;
        };
        Insert: {
          badge_id?: string;
          description?: string | null;
          name: string;
        };
        Update: {
          badge_id?: string;
          description?: string | null;
          name?: string;
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
          explanation: string | null;
          image: string;
          status: string;
          user_email: string;
        };
        Insert: {
          content_id?: string;
          explanation?: string | null;
          image: string;
          status: string;
          user_email: string;
        };
        Update: {
          content_id?: string;
          explanation?: string | null;
          image?: string;
          status?: string;
          user_email?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contents_user_email_fkey";
            columns: ["user_email"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["email"];
          },
        ];
      };
      users: {
        Row: {
          email: string;
          password: string;
          user_id: string;
          username: string;
        };
        Insert: {
          email: string;
          password: string;
          user_id?: string;
          username: string;
        };
        Update: {
          email?: string;
          password?: string;
          user_id?: string;
          username?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
