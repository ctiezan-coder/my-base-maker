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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          accompaniment_status: string | null
          aciex_interaction_history: string | null
          activity_sector: string | null
          annual_turnover: number | null
          certifications: string[] | null
          city: string | null
          commercial_events_participation:
            | Database["public"]["Enums"]["participation_type"]
            | null
          company_name: string
          company_size: Database["public"]["Enums"]["company_size"] | null
          created_at: string
          created_by: string | null
          creation_date: string | null
          current_export_markets: string[] | null
          dfe_number: string
          direction_id: string | null
          email: string | null
          export_manager_email: string | null
          export_manager_name: string | null
          export_manager_phone: string | null
          exported_products: string | null
          has_export_service: boolean | null
          headquarters_location: string
          id: string
          legal_form: Database["public"]["Enums"]["company_legal_form"] | null
          legal_representative_email: string | null
          legal_representative_gender:
            | Database["public"]["Enums"]["gender"]
            | null
          legal_representative_name: string | null
          legal_representative_phone: string | null
          phone: string | null
          postal_address: string | null
          products_services: string | null
          rccm_number: string
          support_needed: Database["public"]["Enums"]["support_type"] | null
          target_export_markets: string[] | null
          trade_name: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          accompaniment_status?: string | null
          aciex_interaction_history?: string | null
          activity_sector?: string | null
          annual_turnover?: number | null
          certifications?: string[] | null
          city?: string | null
          commercial_events_participation?:
            | Database["public"]["Enums"]["participation_type"]
            | null
          company_name: string
          company_size?: Database["public"]["Enums"]["company_size"] | null
          created_at?: string
          created_by?: string | null
          creation_date?: string | null
          current_export_markets?: string[] | null
          dfe_number: string
          direction_id?: string | null
          email?: string | null
          export_manager_email?: string | null
          export_manager_name?: string | null
          export_manager_phone?: string | null
          exported_products?: string | null
          has_export_service?: boolean | null
          headquarters_location: string
          id?: string
          legal_form?: Database["public"]["Enums"]["company_legal_form"] | null
          legal_representative_email?: string | null
          legal_representative_gender?:
            | Database["public"]["Enums"]["gender"]
            | null
          legal_representative_name?: string | null
          legal_representative_phone?: string | null
          phone?: string | null
          postal_address?: string | null
          products_services?: string | null
          rccm_number: string
          support_needed?: Database["public"]["Enums"]["support_type"] | null
          target_export_markets?: string[] | null
          trade_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          accompaniment_status?: string | null
          aciex_interaction_history?: string | null
          activity_sector?: string | null
          annual_turnover?: number | null
          certifications?: string[] | null
          city?: string | null
          commercial_events_participation?:
            | Database["public"]["Enums"]["participation_type"]
            | null
          company_name?: string
          company_size?: Database["public"]["Enums"]["company_size"] | null
          created_at?: string
          created_by?: string | null
          creation_date?: string | null
          current_export_markets?: string[] | null
          dfe_number?: string
          direction_id?: string | null
          email?: string | null
          export_manager_email?: string | null
          export_manager_name?: string | null
          export_manager_phone?: string | null
          exported_products?: string | null
          has_export_service?: boolean | null
          headquarters_location?: string
          id?: string
          legal_form?: Database["public"]["Enums"]["company_legal_form"] | null
          legal_representative_email?: string | null
          legal_representative_gender?:
            | Database["public"]["Enums"]["gender"]
            | null
          legal_representative_name?: string | null
          legal_representative_phone?: string | null
          phone?: string | null
          postal_address?: string | null
          products_services?: string | null
          rccm_number?: string
          support_needed?: Database["public"]["Enums"]["support_type"] | null
          target_export_markets?: string[] | null
          trade_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      directions: {
        Row: {
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          name: string
          priority: string
          volume_estimate: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          name: string
          priority: string
          volume_estimate?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          name?: string
          priority?: string
          volume_estimate?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          direction_id: string
          document_category:
            | Database["public"]["Enums"]["document_category"]
            | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          folder_id: string | null
          id: string
          priority_level: Database["public"]["Enums"]["priority_level"] | null
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          direction_id: string
          document_category?:
            | Database["public"]["Enums"]["document_category"]
            | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder_id?: string | null
          id?: string
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          direction_id?: string
          document_category?:
            | Database["public"]["Enums"]["document_category"]
            | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder_id?: string | null
          id?: string
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          direction_id: string
          end_date: string
          event_type: string
          id: string
          location: string | null
          max_participants: number | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id: string
          end_date: string
          event_type: string
          id?: string
          location?: string | null
          max_participants?: number | null
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id?: string
          end_date?: string
          event_type?: string
          id?: string
          location?: string | null
          max_participants?: number | null
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string
          created_by: string | null
          direction_id: string
          id: string
          name: string
          parent_folder_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          direction_id: string
          id?: string
          name: string
          parent_folder_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          direction_id?: string
          id?: string
          name?: string
          parent_folder_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_tracking: {
        Row: {
          created_at: string
          created_by: string | null
          direction_id: string
          id: string
          kpi_name: string
          kpi_value: number
          notes: string | null
          period: string
          target_value: number | null
          unit: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          direction_id: string
          id?: string
          kpi_name: string
          kpi_value: number
          notes?: string | null
          period: string
          target_value?: number | null
          unit?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          direction_id?: string
          id?: string
          kpi_name?: string
          kpi_value?: number
          notes?: string | null
          period?: string
          target_value?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_tracking_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
        ]
      }
      media_content: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          direction_id: string
          file_size: number | null
          file_url: string | null
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          priority_level: Database["public"]["Enums"]["priority_level"] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          media_type: Database["public"]["Enums"]["media_type"]
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      partnerships: {
        Row: {
          budget: number | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          description: string | null
          direction_id: string
          end_date: string | null
          id: string
          partner_name: string
          partner_type: string | null
          priority_level: Database["public"]["Enums"]["priority_level"] | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id: string
          end_date?: string | null
          id?: string
          partner_name: string
          partner_type?: string | null
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id?: string
          end_date?: string | null
          id?: string
          partner_name?: string
          partner_type?: string | null
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partnerships_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          direction: string | null
          email: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          direction?: string | null
          email: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          direction?: string | null
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          created_at: string
          created_by: string | null
          description: string | null
          dfe_number: string | null
          direction_id: string
          end_date: string | null
          id: string
          name: string
          priority_level: Database["public"]["Enums"]["priority_level"] | null
          rccm_number: string | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dfe_number?: string | null
          direction_id: string
          end_date?: string | null
          id?: string
          name: string
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          rccm_number?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dfe_number?: string | null
          direction_id?: string
          end_date?: string | null
          id?: string
          name?: string
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          rccm_number?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          bio: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          organization: string | null
          phone: string | null
          specialization: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          organization?: string | null
          phone?: string | null
          specialization?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          organization?: string | null
          phone?: string | null
          specialization?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      training_registrations: {
        Row: {
          attended: boolean | null
          certificate_issued: boolean | null
          company_id: string | null
          created_at: string
          evaluation_comments: string | null
          evaluation_score: number | null
          id: string
          participant_email: string
          participant_name: string
          participant_phone: string | null
          participant_position: string | null
          registration_date: string
          status: Database["public"]["Enums"]["registration_status"] | null
          training_id: string
          updated_at: string
        }
        Insert: {
          attended?: boolean | null
          certificate_issued?: boolean | null
          company_id?: string | null
          created_at?: string
          evaluation_comments?: string | null
          evaluation_score?: number | null
          id?: string
          participant_email: string
          participant_name: string
          participant_phone?: string | null
          participant_position?: string | null
          registration_date?: string
          status?: Database["public"]["Enums"]["registration_status"] | null
          training_id: string
          updated_at?: string
        }
        Update: {
          attended?: boolean | null
          certificate_issued?: boolean | null
          company_id?: string | null
          created_at?: string
          evaluation_comments?: string | null
          evaluation_score?: number | null
          id?: string
          participant_email?: string
          participant_name?: string
          participant_phone?: string | null
          participant_position?: string | null
          registration_date?: string
          status?: Database["public"]["Enums"]["registration_status"] | null
          training_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      trainings: {
        Row: {
          created_at: string
          created_by: string | null
          current_participants: number | null
          description: string | null
          direction_id: string
          end_date: string
          id: string
          location: string | null
          max_participants: number | null
          start_date: string
          title: string
          trainer_ids: string[] | null
          training_type: Database["public"]["Enums"]["training_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          direction_id: string
          end_date: string
          id?: string
          location?: string | null
          max_participants?: number | null
          start_date: string
          title: string
          trainer_ids?: string[] | null
          training_type: Database["public"]["Enums"]["training_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          direction_id?: string
          end_date?: string
          id?: string
          location?: string | null
          max_participants?: number | null
          start_date?: string
          title?: string
          trainer_ids?: string[] | null
          training_type?: Database["public"]["Enums"]["training_type"]
          updated_at?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "manager" | "user"
      company_legal_form:
        | "SA"
        | "SARL"
        | "SAS"
        | "SASU"
        | "EI"
        | "GIE"
        | "Autre"
      company_size: "TPE" | "PME" | "ETI" | "Grande entreprise"
      document_category:
        | "Convention exportation"
        | "Agrément"
        | "Licence"
        | "Texte légal"
        | "Accord partenariat"
        | "MoU"
        | "Protocole collaboration"
        | "Manuel"
        | "Politique"
        | "Procédure"
        | "Formulaire"
        | "Contrat PPP"
        | "Contrat stage"
        | "Fiche de poste"
        | "Étude marché"
        | "PTBA"
        | "TDR"
        | "Autre"
      gender: "Homme" | "Femme"
      media_type:
        | "Newsletter"
        | "Magazine"
        | "Création graphique"
        | "Film institutionnel"
        | "Reportage"
        | "Capsule vidéo"
        | "Photo"
        | "Article presse"
        | "Interview audio"
        | "Autre"
      participation_type: "Foires" | "Salons" | "Jamais"
      priority_level: "1" | "3" | "5"
      registration_status:
        | "En attente"
        | "Confirmée"
        | "Annulée"
        | "Présent"
        | "Absent"
      support_type: "Financier" | "Non financier" | "Les deux"
      training_type:
        | "Formation"
        | "Atelier"
        | "Coaching"
        | "Webinaire"
        | "Autre"
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
      app_role: ["admin", "manager", "user"],
      company_legal_form: ["SA", "SARL", "SAS", "SASU", "EI", "GIE", "Autre"],
      company_size: ["TPE", "PME", "ETI", "Grande entreprise"],
      document_category: [
        "Convention exportation",
        "Agrément",
        "Licence",
        "Texte légal",
        "Accord partenariat",
        "MoU",
        "Protocole collaboration",
        "Manuel",
        "Politique",
        "Procédure",
        "Formulaire",
        "Contrat PPP",
        "Contrat stage",
        "Fiche de poste",
        "Étude marché",
        "PTBA",
        "TDR",
        "Autre",
      ],
      gender: ["Homme", "Femme"],
      media_type: [
        "Newsletter",
        "Magazine",
        "Création graphique",
        "Film institutionnel",
        "Reportage",
        "Capsule vidéo",
        "Photo",
        "Article presse",
        "Interview audio",
        "Autre",
      ],
      participation_type: ["Foires", "Salons", "Jamais"],
      priority_level: ["1", "3", "5"],
      registration_status: [
        "En attente",
        "Confirmée",
        "Annulée",
        "Présent",
        "Absent",
      ],
      support_type: ["Financier", "Non financier", "Les deux"],
      training_type: ["Formation", "Atelier", "Coaching", "Webinaire", "Autre"],
    },
  },
} as const
