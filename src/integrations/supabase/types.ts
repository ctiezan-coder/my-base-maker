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
      business_connections: {
        Row: {
          company_id: string | null
          connection_date: string
          contract_duration_years: number | null
          contract_value: number
          created_at: string
          created_by: string | null
          currency: string | null
          destination_country: string
          direction_id: string | null
          id: string
          jobs_created: number | null
          partner_name: string
          pme_name: string
          sector: string
          social_impact: string | null
          status: Database["public"]["Enums"]["connection_status"]
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          connection_date?: string
          contract_duration_years?: number | null
          contract_value: number
          created_at?: string
          created_by?: string | null
          currency?: string | null
          destination_country: string
          direction_id?: string | null
          id?: string
          jobs_created?: number | null
          partner_name: string
          pme_name: string
          sector: string
          social_impact?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          connection_date?: string
          contract_duration_years?: number | null
          contract_value?: number
          created_at?: string
          created_by?: string | null
          currency?: string | null
          destination_country?: string
          direction_id?: string | null
          id?: string
          jobs_created?: number | null
          partner_name?: string
          pme_name?: string
          sector?: string
          social_impact?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_connections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          receiver_ids: string[]
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          receiver_ids: string[]
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          receiver_ids?: string[]
          sender_id?: string
        }
        Relationships: []
      }
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
      company_market_interests: {
        Row: {
          company_id: string
          created_at: string
          id: string
          interest_level: string | null
          market_id: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          interest_level?: string | null
          market_id: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          interest_level?: string | null
          market_id?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_market_interests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_market_interests_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "potential_markets"
            referencedColumns: ["id"]
          },
        ]
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
      event_participants: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          event_id: string
          id: string
          notes: string | null
          registration_date: string
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          event_id: string
          id?: string
          notes?: string | null
          registration_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          registration_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
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
      export_opportunities: {
        Row: {
          compatibility_score: number | null
          created_at: string
          created_by: string | null
          currency: string | null
          deadline: string
          description: string
          destination_city: string | null
          destination_country: string
          direction_id: string | null
          estimated_value: number
          id: string
          region: Database["public"]["Enums"]["market_region"]
          requirements: string[] | null
          sector: string
          status: Database["public"]["Enums"]["opportunity_status"] | null
          title: string
          updated_at: string
          volume: string
        }
        Insert: {
          compatibility_score?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deadline: string
          description: string
          destination_city?: string | null
          destination_country: string
          direction_id?: string | null
          estimated_value: number
          id?: string
          region: Database["public"]["Enums"]["market_region"]
          requirements?: string[] | null
          sector: string
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          title: string
          updated_at?: string
          volume: string
        }
        Update: {
          compatibility_score?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deadline?: string
          description?: string
          destination_city?: string | null
          destination_country?: string
          direction_id?: string | null
          estimated_value?: number
          id?: string
          region?: Database["public"]["Enums"]["market_region"]
          requirements?: string[] | null
          sector?: string
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          title?: string
          updated_at?: string
          volume?: string
        }
        Relationships: []
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
      imputation_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          imputation_id: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          imputation_id: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          imputation_id?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imputation_attachments_imputation_id_fkey"
            columns: ["imputation_id"]
            isOneToOne: false
            referencedRelation: "imputations"
            referencedColumns: ["id"]
          },
        ]
      }
      imputations: {
        Row: {
          created_at: string
          created_by: string | null
          date_imputation: string | null
          date_realisation: string | null
          date_reception: string
          direction_id: string | null
          etat: string
          id: string
          imputation: string
          objet: string
          observations: string | null
          provenance: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date_imputation?: string | null
          date_realisation?: string | null
          date_reception: string
          direction_id?: string | null
          etat?: string
          id?: string
          imputation: string
          objet: string
          observations?: string | null
          provenance: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date_imputation?: string | null
          date_realisation?: string | null
          date_reception?: string
          direction_id?: string | null
          etat?: string
          id?: string
          imputation?: string
          objet?: string
          observations?: string | null
          provenance?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "imputations_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
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
      market_alert_preferences: {
        Row: {
          countries: string[] | null
          created_at: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          max_value: number | null
          min_value: number | null
          name: string
          notification_type: string
          regions: string[] | null
          sectors: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          countries?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          max_value?: number | null
          min_value?: number | null
          name: string
          notification_type?: string
          regions?: string[] | null
          sectors?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          countries?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          max_value?: number | null
          min_value?: number | null
          name?: string
          notification_type?: string
          regions?: string[] | null
          sectors?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      market_alerts: {
        Row: {
          email_sent: boolean | null
          id: string
          notification_sent: boolean | null
          opportunity_id: string
          preference_id: string
          sent_at: string | null
          user_id: string
        }
        Insert: {
          email_sent?: boolean | null
          id?: string
          notification_sent?: boolean | null
          opportunity_id: string
          preference_id: string
          sent_at?: string | null
          user_id: string
        }
        Update: {
          email_sent?: boolean | null
          id?: string
          notification_sent?: boolean | null
          opportunity_id?: string
          preference_id?: string
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_alerts_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "export_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_alerts_preference_id_fkey"
            columns: ["preference_id"]
            isOneToOne: false
            referencedRelation: "market_alert_preferences"
            referencedColumns: ["id"]
          },
        ]
      }
      market_statistics: {
        Row: {
          active_markets: number | null
          average_deal_days: number | null
          business_connections_count: number | null
          conversion_rate: number | null
          created_at: string
          direction_id: string | null
          export_value_billions: number
          id: string
          intra_african_trade_percent: number | null
          pme_count: number | null
          total_value_generated: number | null
          updated_at: string
          year: number
        }
        Insert: {
          active_markets?: number | null
          average_deal_days?: number | null
          business_connections_count?: number | null
          conversion_rate?: number | null
          created_at?: string
          direction_id?: string | null
          export_value_billions: number
          id?: string
          intra_african_trade_percent?: number | null
          pme_count?: number | null
          total_value_generated?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          active_markets?: number | null
          average_deal_days?: number | null
          business_connections_count?: number | null
          conversion_rate?: number | null
          created_at?: string
          direction_id?: string | null
          export_value_billions?: number
          id?: string
          intra_african_trade_percent?: number | null
          pme_count?: number | null
          total_value_generated?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      media_content: {
        Row: {
          budget_estime: number | null
          categorie_niveau:
            | Database["public"]["Enums"]["niveau_categorisation"]
            | null
          cibles: string | null
          contexte_activite: string | null
          created_at: string
          created_by: string | null
          date_demande: string | null
          date_evenement: string | null
          date_livraison_effective: string | null
          date_livraison_prevue: string | null
          delai_traitement_semaines: number | null
          deroule: string | null
          description: string | null
          direction_id: string
          enjeux: string | null
          entites_externes: string[] | null
          event_id: string | null
          file_size: number | null
          file_url: string | null
          heure_evenement: string | null
          id: string
          lieu_evenement: string | null
          media_type: Database["public"]["Enums"]["media_type"]
          objectifs: string | null
          observations: string | null
          panelistes: string | null
          parties_prenantes: string | null
          partnership_id: string | null
          phase_communication:
            | Database["public"]["Enums"]["phase_communication"]
            | null
          priority_level: Database["public"]["Enums"]["priority_level"] | null
          role_agence: Database["public"]["Enums"]["role_agence"] | null
          statut_workflow: Database["public"]["Enums"]["statut_workflow"] | null
          supports_demandes: string[] | null
          title: string
          type_activite: Database["public"]["Enums"]["type_activite"] | null
          updated_at: string
        }
        Insert: {
          budget_estime?: number | null
          categorie_niveau?:
            | Database["public"]["Enums"]["niveau_categorisation"]
            | null
          cibles?: string | null
          contexte_activite?: string | null
          created_at?: string
          created_by?: string | null
          date_demande?: string | null
          date_evenement?: string | null
          date_livraison_effective?: string | null
          date_livraison_prevue?: string | null
          delai_traitement_semaines?: number | null
          deroule?: string | null
          description?: string | null
          direction_id: string
          enjeux?: string | null
          entites_externes?: string[] | null
          event_id?: string | null
          file_size?: number | null
          file_url?: string | null
          heure_evenement?: string | null
          id?: string
          lieu_evenement?: string | null
          media_type: Database["public"]["Enums"]["media_type"]
          objectifs?: string | null
          observations?: string | null
          panelistes?: string | null
          parties_prenantes?: string | null
          partnership_id?: string | null
          phase_communication?:
            | Database["public"]["Enums"]["phase_communication"]
            | null
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          role_agence?: Database["public"]["Enums"]["role_agence"] | null
          statut_workflow?:
            | Database["public"]["Enums"]["statut_workflow"]
            | null
          supports_demandes?: string[] | null
          title: string
          type_activite?: Database["public"]["Enums"]["type_activite"] | null
          updated_at?: string
        }
        Update: {
          budget_estime?: number | null
          categorie_niveau?:
            | Database["public"]["Enums"]["niveau_categorisation"]
            | null
          cibles?: string | null
          contexte_activite?: string | null
          created_at?: string
          created_by?: string | null
          date_demande?: string | null
          date_evenement?: string | null
          date_livraison_effective?: string | null
          date_livraison_prevue?: string | null
          delai_traitement_semaines?: number | null
          deroule?: string | null
          description?: string | null
          direction_id?: string
          enjeux?: string | null
          entites_externes?: string[] | null
          event_id?: string | null
          file_size?: number | null
          file_url?: string | null
          heure_evenement?: string | null
          id?: string
          lieu_evenement?: string | null
          media_type?: Database["public"]["Enums"]["media_type"]
          objectifs?: string | null
          observations?: string | null
          panelistes?: string | null
          parties_prenantes?: string | null
          partnership_id?: string | null
          phase_communication?:
            | Database["public"]["Enums"]["phase_communication"]
            | null
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          role_agence?: Database["public"]["Enums"]["role_agence"] | null
          statut_workflow?:
            | Database["public"]["Enums"]["statut_workflow"]
            | null
          supports_demandes?: string[] | null
          title?: string
          type_activite?: Database["public"]["Enums"]["type_activite"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_content_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_content_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          reference_id: string | null
          reference_table: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          reference_id?: string | null
          reference_table?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          reference_id?: string | null
          reference_table?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunity_applications: {
        Row: {
          application_date: string
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          opportunity_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          application_date?: string
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          opportunity_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          application_date?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          opportunity_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "export_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      partnership_projects: {
        Row: {
          created_at: string
          id: string
          partnership_id: string
          project_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          partnership_id: string
          project_id: string
        }
        Update: {
          created_at?: string
          id?: string
          partnership_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partnership_projects_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnership_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      permission_history: {
        Row: {
          action: string
          created_at: string
          direction_id: string | null
          id: string
          module: Database["public"]["Enums"]["app_module"] | null
          new_role: Database["public"]["Enums"]["app_role"] | null
          old_role: Database["public"]["Enums"]["app_role"] | null
          target_user_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          direction_id?: string | null
          id?: string
          module?: Database["public"]["Enums"]["app_module"] | null
          new_role?: Database["public"]["Enums"]["app_role"] | null
          old_role?: Database["public"]["Enums"]["app_role"] | null
          target_user_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          direction_id?: string | null
          id?: string
          module?: Database["public"]["Enums"]["app_module"] | null
          new_role?: Database["public"]["Enums"]["app_role"] | null
          old_role?: Database["public"]["Enums"]["app_role"] | null
          target_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permission_history_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
        ]
      }
      potential_markets: {
        Row: {
          country: string
          created_at: string
          demand_description: string | null
          direction_id: string | null
          growth_rate: number | null
          id: string
          key_products: string[] | null
          market_potential: string
          market_size_billion: number | null
          region: Database["public"]["Enums"]["market_region"]
          requirements: string[] | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          sector: string
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          demand_description?: string | null
          direction_id?: string | null
          growth_rate?: number | null
          id?: string
          key_products?: string[] | null
          market_potential: string
          market_size_billion?: number | null
          region: Database["public"]["Enums"]["market_region"]
          requirements?: string[] | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          sector: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          demand_description?: string | null
          direction_id?: string | null
          growth_rate?: number | null
          id?: string
          key_products?: string[] | null
          market_potential?: string
          market_size_billion?: number | null
          region?: Database["public"]["Enums"]["market_region"]
          requirements?: string[] | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          sector?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string
          avatar_url: string | null
          created_at: string
          direction: string | null
          direction_id: string
          email: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: string
          avatar_url?: string | null
          created_at?: string
          direction?: string | null
          direction_id: string
          email: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: string
          avatar_url?: string | null
          created_at?: string
          direction?: string | null
          direction_id?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tracking: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          project_id: string
          status: string
          tracking_date: string
          tracking_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          project_id: string
          status?: string
          tracking_date: string
          tracking_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          project_id?: string
          status?: string
          tracking_date?: string
          tracking_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tracking_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      tasks: {
        Row: {
          assigned_to: string | null
          company_id: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          direction_id: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          direction_id?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          direction_id?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_direction_id_fkey"
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
      user_role_assignments: {
        Row: {
          created_at: string
          direction_id: string
          id: string
          module: Database["public"]["Enums"]["app_module"]
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          direction_id: string
          id?: string
          module: Database["public"]["Enums"]["app_module"]
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          direction_id?: string
          id?: string
          module?: Database["public"]["Enums"]["app_module"]
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_assignments_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
        ]
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
      create_notification: {
        Args: {
          p_message: string
          p_reference_id?: string
          p_reference_table?: string
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: undefined
      }
      has_any_module_permission: {
        Args: {
          _module: Database["public"]["Enums"]["app_module"]
          _required_role?: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_module_permission: {
        Args: {
          _direction_id: string
          _module: Database["public"]["Enums"]["app_module"]
          _required_role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_account_approved: { Args: { _user_id: string }; Returns: boolean }
      user_has_direction_access: {
        Args: { _direction_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_module:
        | "companies"
        | "projects"
        | "documents"
        | "events"
        | "trainings"
        | "kpis"
        | "market_development"
        | "partnerships"
        | "media"
        | "collaborators"
        | "imputations"
        | "suivi_evaluation"
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
      connection_status:
        | "En négociation"
        | "Contrat signé"
        | "En cours"
        | "Terminé"
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
        | "Rapport"
        | "Contrat"
        | "Note"
        | "Présentation"
      gender: "Homme" | "Femme"
      market_region:
        | "Europe"
        | "Afrique"
        | "ZLECAf"
        | "Asie"
        | "Moyen-Orient"
        | "Amérique du Nord"
        | "Amérique du Sud"
      media_type:
        | "Newsletter"
        | "Magazine"
        | "Article presse"
        | "Communiqué de presse"
        | "Dossier de presse"
        | "Branding visuel"
        | "Fond de scène"
        | "Mur de photo"
        | "Dépliant"
        | "Flyer"
        | "Kakemono"
        | "Affiche"
        | "Bannière web"
        | "Post réseaux sociaux"
        | "Film institutionnel"
        | "Reportage"
        | "Capsule vidéo"
        | "Interview audio"
        | "Photo professionnelle"
        | "Couverture événement"
        | "Support présentation"
        | "Autre"
      niveau_categorisation: "Niveau 1" | "Niveau 2" | "Niveau 3"
      opportunity_status:
        | "URGENT"
        | "NOUVEAU"
        | "RECOMMANDÉ"
        | "EN_COURS"
        | "FERMÉ"
      participation_type: "Foires" | "Salons" | "Jamais"
      phase_communication:
        | "Avant événement"
        | "Pendant événement"
        | "Après événement"
      priority_level: "1" | "3" | "5"
      registration_status:
        | "En attente"
        | "Confirmée"
        | "Annulée"
        | "Présent"
        | "Absent"
      risk_level: "Faible" | "Modéré" | "Élevé"
      role_agence:
        | "Organisateur"
        | "Co-organisateur"
        | "Participant"
        | "Intervenant"
      statut_workflow: "Demande" | "En cours" | "Validé" | "Livré" | "Annulé"
      support_type: "Financier" | "Non financier" | "Les deux"
      training_type:
        | "Formation"
        | "Atelier"
        | "Coaching"
        | "Webinaire"
        | "Autre"
      type_activite:
        | "Séminaire"
        | "Formation"
        | "Signature de convention"
        | "Foire / Salon"
        | "Panel"
        | "Appel à Manifestations d'Intérêts"
        | "Cérémonie"
        | "Masterclass"
        | "Forum économique"
        | "Mission officielle"
        | "Journée Portes Ouvertes"
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
      app_module: [
        "companies",
        "projects",
        "documents",
        "events",
        "trainings",
        "kpis",
        "market_development",
        "partnerships",
        "media",
        "collaborators",
        "imputations",
        "suivi_evaluation",
      ],
      app_role: ["admin", "manager", "user"],
      company_legal_form: ["SA", "SARL", "SAS", "SASU", "EI", "GIE", "Autre"],
      company_size: ["TPE", "PME", "ETI", "Grande entreprise"],
      connection_status: [
        "En négociation",
        "Contrat signé",
        "En cours",
        "Terminé",
      ],
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
        "Rapport",
        "Contrat",
        "Note",
        "Présentation",
      ],
      gender: ["Homme", "Femme"],
      market_region: [
        "Europe",
        "Afrique",
        "ZLECAf",
        "Asie",
        "Moyen-Orient",
        "Amérique du Nord",
        "Amérique du Sud",
      ],
      media_type: [
        "Newsletter",
        "Magazine",
        "Article presse",
        "Communiqué de presse",
        "Dossier de presse",
        "Branding visuel",
        "Fond de scène",
        "Mur de photo",
        "Dépliant",
        "Flyer",
        "Kakemono",
        "Affiche",
        "Bannière web",
        "Post réseaux sociaux",
        "Film institutionnel",
        "Reportage",
        "Capsule vidéo",
        "Interview audio",
        "Photo professionnelle",
        "Couverture événement",
        "Support présentation",
        "Autre",
      ],
      niveau_categorisation: ["Niveau 1", "Niveau 2", "Niveau 3"],
      opportunity_status: [
        "URGENT",
        "NOUVEAU",
        "RECOMMANDÉ",
        "EN_COURS",
        "FERMÉ",
      ],
      participation_type: ["Foires", "Salons", "Jamais"],
      phase_communication: [
        "Avant événement",
        "Pendant événement",
        "Après événement",
      ],
      priority_level: ["1", "3", "5"],
      registration_status: [
        "En attente",
        "Confirmée",
        "Annulée",
        "Présent",
        "Absent",
      ],
      risk_level: ["Faible", "Modéré", "Élevé"],
      role_agence: [
        "Organisateur",
        "Co-organisateur",
        "Participant",
        "Intervenant",
      ],
      statut_workflow: ["Demande", "En cours", "Validé", "Livré", "Annulé"],
      support_type: ["Financier", "Non financier", "Les deux"],
      training_type: ["Formation", "Atelier", "Coaching", "Webinaire", "Autre"],
      type_activite: [
        "Séminaire",
        "Formation",
        "Signature de convention",
        "Foire / Salon",
        "Panel",
        "Appel à Manifestations d'Intérêts",
        "Cérémonie",
        "Masterclass",
        "Forum économique",
        "Mission officielle",
        "Journée Portes Ouvertes",
        "Autre",
      ],
    },
  },
} as const
