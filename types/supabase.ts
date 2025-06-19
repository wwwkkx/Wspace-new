export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password: string | null
          name: string | null
          image: string | null
          created_at: string
          updated_at: string
          email_verified: string | null
          notion_token: string | null
          notion_database_id: string | null
          workspace_name: string | null
          workspace_id: string | null
          bot_id: string | null
          database_name: string | null
          authorized_at: string | null
        }
        Insert: {
          id?: string
          email: string
          password?: string | null
          name?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
          email_verified?: string | null
          notion_token?: string | null
          notion_database_id?: string | null
          workspace_name?: string | null
          workspace_id?: string | null
          bot_id?: string | null
          database_name?: string | null
          authorized_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          password?: string | null
          name?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
          email_verified?: string | null
          notion_token?: string | null
          notion_database_id?: string | null
          workspace_name?: string | null
          workspace_id?: string | null
          bot_id?: string | null
          database_name?: string | null
          authorized_at?: string | null
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          type: string
          provider: string
          provider_account_id: string
          refresh_token: string | null
          access_token: string | null
          expires_at: number | null
          token_type: string | null
          scope: string | null
          id_token: string | null
          session_state: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          provider: string
          provider_account_id: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          provider?: string
          provider_account_id?: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
        }
      }
      sessions: {
        Row: {
          id: string
          session_token: string
          user_id: string
          expires: string
        }
        Insert: {
          id?: string
          session_token: string
          user_id: string
          expires: string
        }
        Update: {
          id?: string
          session_token?: string
          user_id?: string
          expires?: string
        }
      }
      verification_tokens: {
        Row: {
          identifier: string
          token: string
          expires: string
        }
        Insert: {
          identifier: string
          token: string
          expires: string
        }
        Update: {
          identifier?: string
          token?: string
          expires?: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          original_content: string
          summary: string
          category: string
          tags: string
          priority: string
          action_items: string
          insights: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          original_content: string
          summary: string
          category: string
          tags: string
          priority: string
          action_items: string
          insights: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          original_content?: string
          summary?: string
          category?: string
          tags?: string
          priority?: string
          action_items?: string
          insights?: string
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_size: number
          original_content: string
          title: string
          summary: string
          category: string
          tags: string
          key_points: string
          action_items: string
          document_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_size: number
          original_content: string
          title: string
          summary: string
          category: string
          tags: string
          key_points: string
          action_items: string
          document_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_size?: number
          original_content?: string
          title?: string
          summary?: string
          category?: string
          tags?: string
          key_points?: string
          action_items?: string
          document_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      ai_configs: {
        Row: {
          id: string
          name: string
          endpoint: string
          api_key: string
          model: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          endpoint: string
          api_key: string
          model: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          endpoint?: string
          api_key?: string
          model?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          session_id: string
          role: string
          content: string
          search_results: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: string
          content: string
          search_results?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: string
          content?: string
          search_results?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}