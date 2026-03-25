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
      accounting_accounts: {
        Row: {
          account_name: string
          account_number: string
          account_type: string
          balance: number | null
          created_at: string
          id: string
          mission_id: string | null
          notes: string | null
          parent_account_id: string | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          account_type: string
          balance?: number | null
          created_at?: string
          id?: string
          mission_id?: string | null
          notes?: string | null
          parent_account_id?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string
          balance?: number | null
          created_at?: string
          id?: string
          mission_id?: string | null
          notes?: string | null
          parent_account_id?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_accounts_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "accounting_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_accounts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_entries: {
        Row: {
          account_id: string
          amount: number
          created_at: string
          created_by: string | null
          description: string
          direction_id: string | null
          entry_date: string
          entry_number: string
          entry_type: Database["public"]["Enums"]["accounting_entry_type"]
          id: string
          project_id: string | null
          reference: string | null
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string
          created_by?: string | null
          description: string
          direction_id?: string | null
          entry_date: string
          entry_number: string
          entry_type: Database["public"]["Enums"]["accounting_entry_type"]
          id?: string
          project_id?: string | null
          reference?: string | null
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string
          created_by?: string | null
          description?: string
          direction_id?: string | null
          entry_date?: string
          entry_number?: string
          entry_type?: Database["public"]["Enums"]["accounting_entry_type"]
          id?: string
          project_id?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounting_entries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounting_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_entries_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      action_plan_activities: {
        Row: {
          action_plan_id: string
          created_at: string
          current_value: number | null
          description: string | null
          end_date: string | null
          id: string
          kpi_indicator: string | null
          notes: string | null
          obstacles: string | null
          resources_needed: string | null
          responsible: string | null
          start_date: string | null
          status: string | null
          target_value: number | null
          title: string
          updated_at: string
        }
        Insert: {
          action_plan_id: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          kpi_indicator?: string | null
          notes?: string | null
          obstacles?: string | null
          resources_needed?: string | null
          responsible?: string | null
          start_date?: string | null
          status?: string | null
          target_value?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          action_plan_id?: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          kpi_indicator?: string | null
          notes?: string | null
          obstacles?: string | null
          resources_needed?: string | null
          responsible?: string | null
          start_date?: string | null
          status?: string | null
          target_value?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_plan_activities_action_plan_id_fkey"
            columns: ["action_plan_id"]
            isOneToOne: false
            referencedRelation: "action_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      action_plans: {
        Row: {
          budget_allocated: number | null
          budget_consumed: number | null
          created_at: string
          created_by: string | null
          description: string | null
          direction_id: string
          end_date: string | null
          fiscal_year: number
          id: string
          notes: string | null
          objective_id: string | null
          responsible_user_id: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          budget_allocated?: number | null
          budget_consumed?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id: string
          end_date?: string | null
          fiscal_year?: number
          id?: string
          notes?: string | null
          objective_id?: string | null
          responsible_user_id?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          budget_allocated?: number | null
          budget_consumed?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id?: string
          end_date?: string | null
          fiscal_year?: number
          id?: string
          notes?: string | null
          objective_id?: string | null
          responsible_user_id?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "strategic_objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_roi: {
        Row: {
          activity_id: string | null
          activity_title: string
          activity_type: string
          analysis_period: string | null
          companies_benefited: number | null
          contracts_value: number | null
          created_at: string
          created_by: string | null
          direct_benefits: string | null
          direction_id: string | null
          id: string
          indirect_benefits: string | null
          jobs_created: number | null
          methodology: string | null
          notes: string | null
          roi_percentage: number | null
          social_impact: string | null
          total_cost: number
          total_value_created: number
          updated_at: string
        }
        Insert: {
          activity_id?: string | null
          activity_title: string
          activity_type: string
          analysis_period?: string | null
          companies_benefited?: number | null
          contracts_value?: number | null
          created_at?: string
          created_by?: string | null
          direct_benefits?: string | null
          direction_id?: string | null
          id?: string
          indirect_benefits?: string | null
          jobs_created?: number | null
          methodology?: string | null
          notes?: string | null
          roi_percentage?: number | null
          social_impact?: string | null
          total_cost?: number
          total_value_created?: number
          updated_at?: string
        }
        Update: {
          activity_id?: string | null
          activity_title?: string
          activity_type?: string
          analysis_period?: string | null
          companies_benefited?: number | null
          contracts_value?: number | null
          created_at?: string
          created_by?: string | null
          direct_benefits?: string | null
          direction_id?: string | null
          id?: string
          indirect_benefits?: string | null
          jobs_created?: number | null
          methodology?: string | null
          notes?: string | null
          roi_percentage?: number | null
          social_impact?: string | null
          total_cost?: number
          total_value_created?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_roi_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
        ]
      }
      allowed_emails: {
        Row: {
          added_by: string | null
          created_at: string | null
          email: string
          id: string
          notes: string | null
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          email: string
          id?: string
          notes?: string | null
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          email?: string
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
      benchmarks: {
        Row: {
          analysis_period: string | null
          benchmark_type: string
          benchmark_value: number | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          findings: string | null
          id: string
          indicator: string
          lessons_learned: string | null
          our_value: number | null
          recommendations: string | null
          source: string | null
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          analysis_period?: string | null
          benchmark_type: string
          benchmark_value?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          findings?: string | null
          id?: string
          indicator: string
          lessons_learned?: string | null
          our_value?: number | null
          recommendations?: string | null
          source?: string | null
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          analysis_period?: string | null
          benchmark_type?: string
          benchmark_value?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          findings?: string | null
          id?: string
          indicator?: string
          lessons_learned?: string | null
          our_value?: number | null
          recommendations?: string | null
          source?: string | null
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      budget_entries: {
        Row: {
          accounting_entry_id: string | null
          amount: number
          budget_id: string
          created_at: string
          description: string | null
          entry_date: string
          id: string
        }
        Insert: {
          accounting_entry_id?: string | null
          amount: number
          budget_id: string
          created_at?: string
          description?: string | null
          entry_date?: string
          id?: string
        }
        Update: {
          accounting_entry_id?: string | null
          amount?: number
          budget_id?: string
          created_at?: string
          description?: string | null
          entry_date?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_entries_accounting_entry_id_fkey"
            columns: ["accounting_entry_id"]
            isOneToOne: false
            referencedRelation: "accounting_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_entries_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          allocated_amount: number
          budget_name: string
          consumed_amount: number
          created_at: string
          created_by: string | null
          direction_id: string | null
          employee_id: string | null
          fiscal_year: number
          id: string
          mission_id: string | null
          notes: string | null
          remaining_amount: number | null
          status: string
          updated_at: string
        }
        Insert: {
          allocated_amount?: number
          budget_name: string
          consumed_amount?: number
          created_at?: string
          created_by?: string | null
          direction_id?: string | null
          employee_id?: string | null
          fiscal_year?: number
          id?: string
          mission_id?: string | null
          notes?: string | null
          remaining_amount?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          allocated_amount?: number
          budget_name?: string
          consumed_amount?: number
          created_at?: string
          created_by?: string | null
          direction_id?: string | null
          employee_id?: string | null
          fiscal_year?: number
          id?: string
          mission_id?: string | null
          notes?: string | null
          remaining_amount?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission_orders"
            referencedColumns: ["id"]
          },
        ]
      }
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
      buyer_requests: {
        Row: {
          buyer_id: string
          created_at: string
          created_by: string | null
          currency: string | null
          deadline: string | null
          id: string
          notes: string | null
          products_requested: string[] | null
          request_date: string
          status: string | null
          value_estimated: number | null
          volume_requested: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deadline?: string | null
          id?: string
          notes?: string | null
          products_requested?: string[] | null
          request_date?: string
          status?: string | null
          value_estimated?: number | null
          volume_requested?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deadline?: string | null
          id?: string
          notes?: string | null
          products_requested?: string[] | null
          request_date?: string
          status?: string | null
          value_estimated?: number | null
          volume_requested?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_requests_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "international_buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_products: {
        Row: {
          available_quantity: number | null
          catalog_id: string | null
          category: string | null
          certifications: string[] | null
          company_id: string | null
          created_at: string
          currency: string | null
          description: string | null
          hs_code: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          lead_time_days: number | null
          min_order_quantity: number | null
          origin_region: string | null
          packaging_details: string | null
          price_cif: number | null
          price_fob: number | null
          product_code: string | null
          product_name: string
          production_capacity: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          available_quantity?: number | null
          catalog_id?: string | null
          category?: string | null
          certifications?: string[] | null
          company_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          hs_code?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          lead_time_days?: number | null
          min_order_quantity?: number | null
          origin_region?: string | null
          packaging_details?: string | null
          price_cif?: number | null
          price_fob?: number | null
          product_code?: string | null
          product_name: string
          production_capacity?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          available_quantity?: number | null
          catalog_id?: string | null
          category?: string | null
          certifications?: string[] | null
          company_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          hs_code?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          lead_time_days?: number | null
          min_order_quantity?: number | null
          origin_region?: string | null
          packaging_details?: string | null
          price_cif?: number | null
          price_fob?: number | null
          product_code?: string | null
          product_name?: string
          production_capacity?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_products_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "product_catalogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_products_company_id_fkey"
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
          accompaniment_budget: number | null
          accompaniment_priority: string | null
          accompaniment_start_date: string | null
          accompaniment_status: string | null
          accompaniment_type: string | null
          aciex_interaction_history: string | null
          activity_sector: string | null
          annual_capacity: number | null
          annual_turnover: number | null
          assigned_aciex_officer: string | null
          assigned_aciex_officer_id: string | null
          available_stock: string | null
          can_increase_capacity: boolean | null
          capacity_rating: number | null
          capacity_utilization_rate: number | null
          catalog_url: string | null
          certifications: string[] | null
          city: string | null
          commercial_events_participation:
            | Database["public"]["Enums"]["participation_type"]
            | null
          commune: string | null
          company_category: string | null
          company_name: string
          company_size: Database["public"]["Enums"]["company_size"] | null
          created_at: string
          created_by: string | null
          creation_date: string | null
          current_export_markets: string[] | null
          current_production: number | null
          dfe_number: string
          direction_id: string | null
          distribution_channels: string[] | null
          email: string | null
          engagement_rating: number | null
          export_barriers: string | null
          export_manager_email: string | null
          export_manager_name: string | null
          export_manager_phone: string | null
          export_maturity_level: string | null
          export_performance_score: number | null
          export_rate: number | null
          export_turnover: number | null
          exported_products: string | null
          facebook_url: string | null
          female_employees: number | null
          filiere: string | null
          financial_needs: string | null
          first_contact_date: string | null
          global_risk_level: string | null
          gps_latitude: number | null
          gps_longitude: number | null
          growth_potential: string | null
          has_export_service: boolean | null
          headquarters_location: string
          hs_codes: string[] | null
          id: string
          identified_risks: string | null
          initial_diagnostic: string | null
          instagram_url: string | null
          legal_form: Database["public"]["Enums"]["company_legal_form"] | null
          legal_representative_email: string | null
          legal_representative_gender:
            | Database["public"]["Enums"]["gender"]
            | null
          legal_representative_name: string | null
          legal_representative_phone: string | null
          legal_status: string | null
          linkedin_url: string | null
          logistics_needs: string | null
          main_contact_email: string | null
          main_contact_function: string | null
          main_contact_name: string | null
          main_contact_phone: string | null
          male_employees: number | null
          management_rating: number | null
          managers_count: number | null
          market_share: number | null
          marketing_needs: string | null
          needs_priority: string | null
          permanent_employees: number | null
          phone: string | null
          photo_url: string | null
          postal_address: string | null
          postal_code: string | null
          practiced_incoterms: string[] | null
          product_ranges: string[] | null
          production_equipment: string | null
          production_lead_time_days: number | null
          products_services: string | null
          quality_rating: number | null
          rccm_number: string
          region: string | null
          registration_date_aciex: string | null
          seasonal_employees: number | null
          sigle: string | null
          smart_objectives: Json | null
          specific_needs_details: string | null
          strategic_segment: string | null
          sub_sector: string | null
          support_needed: Database["public"]["Enums"]["support_type"] | null
          target_export_markets: string[] | null
          technical_needs: string | null
          technicians_count: number | null
          total_employees: number | null
          trade_name: string | null
          turnover_category: string | null
          turnover_evolution_3y: Json | null
          twitter_url: string | null
          updated_at: string
          website: string | null
          workers_count: number | null
        }
        Insert: {
          accompaniment_budget?: number | null
          accompaniment_priority?: string | null
          accompaniment_start_date?: string | null
          accompaniment_status?: string | null
          accompaniment_type?: string | null
          aciex_interaction_history?: string | null
          activity_sector?: string | null
          annual_capacity?: number | null
          annual_turnover?: number | null
          assigned_aciex_officer?: string | null
          assigned_aciex_officer_id?: string | null
          available_stock?: string | null
          can_increase_capacity?: boolean | null
          capacity_rating?: number | null
          capacity_utilization_rate?: number | null
          catalog_url?: string | null
          certifications?: string[] | null
          city?: string | null
          commercial_events_participation?:
            | Database["public"]["Enums"]["participation_type"]
            | null
          commune?: string | null
          company_category?: string | null
          company_name: string
          company_size?: Database["public"]["Enums"]["company_size"] | null
          created_at?: string
          created_by?: string | null
          creation_date?: string | null
          current_export_markets?: string[] | null
          current_production?: number | null
          dfe_number: string
          direction_id?: string | null
          distribution_channels?: string[] | null
          email?: string | null
          engagement_rating?: number | null
          export_barriers?: string | null
          export_manager_email?: string | null
          export_manager_name?: string | null
          export_manager_phone?: string | null
          export_maturity_level?: string | null
          export_performance_score?: number | null
          export_rate?: number | null
          export_turnover?: number | null
          exported_products?: string | null
          facebook_url?: string | null
          female_employees?: number | null
          filiere?: string | null
          financial_needs?: string | null
          first_contact_date?: string | null
          global_risk_level?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          growth_potential?: string | null
          has_export_service?: boolean | null
          headquarters_location: string
          hs_codes?: string[] | null
          id?: string
          identified_risks?: string | null
          initial_diagnostic?: string | null
          instagram_url?: string | null
          legal_form?: Database["public"]["Enums"]["company_legal_form"] | null
          legal_representative_email?: string | null
          legal_representative_gender?:
            | Database["public"]["Enums"]["gender"]
            | null
          legal_representative_name?: string | null
          legal_representative_phone?: string | null
          legal_status?: string | null
          linkedin_url?: string | null
          logistics_needs?: string | null
          main_contact_email?: string | null
          main_contact_function?: string | null
          main_contact_name?: string | null
          main_contact_phone?: string | null
          male_employees?: number | null
          management_rating?: number | null
          managers_count?: number | null
          market_share?: number | null
          marketing_needs?: string | null
          needs_priority?: string | null
          permanent_employees?: number | null
          phone?: string | null
          photo_url?: string | null
          postal_address?: string | null
          postal_code?: string | null
          practiced_incoterms?: string[] | null
          product_ranges?: string[] | null
          production_equipment?: string | null
          production_lead_time_days?: number | null
          products_services?: string | null
          quality_rating?: number | null
          rccm_number: string
          region?: string | null
          registration_date_aciex?: string | null
          seasonal_employees?: number | null
          sigle?: string | null
          smart_objectives?: Json | null
          specific_needs_details?: string | null
          strategic_segment?: string | null
          sub_sector?: string | null
          support_needed?: Database["public"]["Enums"]["support_type"] | null
          target_export_markets?: string[] | null
          technical_needs?: string | null
          technicians_count?: number | null
          total_employees?: number | null
          trade_name?: string | null
          turnover_category?: string | null
          turnover_evolution_3y?: Json | null
          twitter_url?: string | null
          updated_at?: string
          website?: string | null
          workers_count?: number | null
        }
        Update: {
          accompaniment_budget?: number | null
          accompaniment_priority?: string | null
          accompaniment_start_date?: string | null
          accompaniment_status?: string | null
          accompaniment_type?: string | null
          aciex_interaction_history?: string | null
          activity_sector?: string | null
          annual_capacity?: number | null
          annual_turnover?: number | null
          assigned_aciex_officer?: string | null
          assigned_aciex_officer_id?: string | null
          available_stock?: string | null
          can_increase_capacity?: boolean | null
          capacity_rating?: number | null
          capacity_utilization_rate?: number | null
          catalog_url?: string | null
          certifications?: string[] | null
          city?: string | null
          commercial_events_participation?:
            | Database["public"]["Enums"]["participation_type"]
            | null
          commune?: string | null
          company_category?: string | null
          company_name?: string
          company_size?: Database["public"]["Enums"]["company_size"] | null
          created_at?: string
          created_by?: string | null
          creation_date?: string | null
          current_export_markets?: string[] | null
          current_production?: number | null
          dfe_number?: string
          direction_id?: string | null
          distribution_channels?: string[] | null
          email?: string | null
          engagement_rating?: number | null
          export_barriers?: string | null
          export_manager_email?: string | null
          export_manager_name?: string | null
          export_manager_phone?: string | null
          export_maturity_level?: string | null
          export_performance_score?: number | null
          export_rate?: number | null
          export_turnover?: number | null
          exported_products?: string | null
          facebook_url?: string | null
          female_employees?: number | null
          filiere?: string | null
          financial_needs?: string | null
          first_contact_date?: string | null
          global_risk_level?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          growth_potential?: string | null
          has_export_service?: boolean | null
          headquarters_location?: string
          hs_codes?: string[] | null
          id?: string
          identified_risks?: string | null
          initial_diagnostic?: string | null
          instagram_url?: string | null
          legal_form?: Database["public"]["Enums"]["company_legal_form"] | null
          legal_representative_email?: string | null
          legal_representative_gender?:
            | Database["public"]["Enums"]["gender"]
            | null
          legal_representative_name?: string | null
          legal_representative_phone?: string | null
          legal_status?: string | null
          linkedin_url?: string | null
          logistics_needs?: string | null
          main_contact_email?: string | null
          main_contact_function?: string | null
          main_contact_name?: string | null
          main_contact_phone?: string | null
          male_employees?: number | null
          management_rating?: number | null
          managers_count?: number | null
          market_share?: number | null
          marketing_needs?: string | null
          needs_priority?: string | null
          permanent_employees?: number | null
          phone?: string | null
          photo_url?: string | null
          postal_address?: string | null
          postal_code?: string | null
          practiced_incoterms?: string[] | null
          product_ranges?: string[] | null
          production_equipment?: string | null
          production_lead_time_days?: number | null
          products_services?: string | null
          quality_rating?: number | null
          rccm_number?: string
          region?: string | null
          registration_date_aciex?: string | null
          seasonal_employees?: number | null
          sigle?: string | null
          smart_objectives?: Json | null
          specific_needs_details?: string | null
          strategic_segment?: string | null
          sub_sector?: string | null
          support_needed?: Database["public"]["Enums"]["support_type"] | null
          target_export_markets?: string[] | null
          technical_needs?: string | null
          technicians_count?: number | null
          total_employees?: number | null
          trade_name?: string | null
          turnover_category?: string | null
          turnover_evolution_3y?: Json | null
          twitter_url?: string | null
          updated_at?: string
          website?: string | null
          workers_count?: number | null
        }
        Relationships: []
      }
      company_accompaniment_actions: {
        Row: {
          action_title: string
          action_type: string | null
          actual_cost: number | null
          company_id: string
          completed_date: string | null
          created_at: string
          description: string | null
          estimated_cost: number | null
          id: string
          notes: string | null
          outcome: string | null
          plan_id: string | null
          planned_date: string | null
          priority: string | null
          responsible_id: string | null
          responsible_name: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          action_title: string
          action_type?: string | null
          actual_cost?: number | null
          company_id: string
          completed_date?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          outcome?: string | null
          plan_id?: string | null
          planned_date?: string | null
          priority?: string | null
          responsible_id?: string | null
          responsible_name?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          action_title?: string
          action_type?: string | null
          actual_cost?: number | null
          company_id?: string
          completed_date?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          outcome?: string | null
          plan_id?: string | null
          planned_date?: string | null
          priority?: string | null
          responsible_id?: string | null
          responsible_name?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_accompaniment_actions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_accompaniment_actions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "company_accompaniment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      company_accompaniment_history: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          documents_shared: string[] | null
          duration_minutes: number | null
          id: string
          interaction_date: string
          interaction_type: string
          location: string | null
          next_steps: string | null
          officer_id: string | null
          officer_name: string | null
          outcome: string | null
          subject: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          documents_shared?: string[] | null
          duration_minutes?: number | null
          id?: string
          interaction_date?: string
          interaction_type: string
          location?: string | null
          next_steps?: string | null
          officer_id?: string | null
          officer_name?: string | null
          outcome?: string | null
          subject: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          documents_shared?: string[] | null
          duration_minutes?: number | null
          id?: string
          interaction_date?: string
          interaction_type?: string
          location?: string | null
          next_steps?: string | null
          officer_id?: string | null
          officer_name?: string | null
          outcome?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_accompaniment_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_accompaniment_plans: {
        Row: {
          aciex_services: string[] | null
          allocated_budget: number | null
          company_id: string
          consumed_budget: number | null
          created_at: string
          created_by: string | null
          end_date: string | null
          fiscal_year: number | null
          id: string
          initial_diagnostic: string | null
          milestones: Json | null
          notes: string | null
          plan_title: string
          responsible_officer_id: string | null
          responsible_officer_name: string | null
          smart_objectives: Json | null
          start_date: string | null
          status: string | null
          success_indicators: Json | null
          updated_at: string
        }
        Insert: {
          aciex_services?: string[] | null
          allocated_budget?: number | null
          company_id: string
          consumed_budget?: number | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          fiscal_year?: number | null
          id?: string
          initial_diagnostic?: string | null
          milestones?: Json | null
          notes?: string | null
          plan_title: string
          responsible_officer_id?: string | null
          responsible_officer_name?: string | null
          smart_objectives?: Json | null
          start_date?: string | null
          status?: string | null
          success_indicators?: Json | null
          updated_at?: string
        }
        Update: {
          aciex_services?: string[] | null
          allocated_budget?: number | null
          company_id?: string
          consumed_budget?: number | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          fiscal_year?: number | null
          id?: string
          initial_diagnostic?: string | null
          milestones?: Json | null
          notes?: string | null
          plan_title?: string
          responsible_officer_id?: string | null
          responsible_officer_name?: string | null
          smart_objectives?: Json | null
          start_date?: string | null
          status?: string | null
          success_indicators?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_accompaniment_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_certifications: {
        Row: {
          certificate_number: string | null
          certificate_url: string | null
          certification_name: string
          certification_type: string
          company_id: string
          created_at: string
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuing_body: string | null
          notes: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          certificate_number?: string | null
          certificate_url?: string | null
          certification_name: string
          certification_type: string
          company_id: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_body?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          certificate_number?: string | null
          certificate_url?: string | null
          certification_name?: string
          certification_type?: string
          company_id?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_body?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_certifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_communications: {
        Row: {
          channel: string | null
          clicked_at: string | null
          communication_type: string
          company_id: string
          content: string | null
          created_at: string
          id: string
          notes: string | null
          opened_at: string | null
          response_date: string | null
          response_received: boolean | null
          sent_by: string | null
          sent_date: string | null
          status: string | null
          subject: string
        }
        Insert: {
          channel?: string | null
          clicked_at?: string | null
          communication_type: string
          company_id: string
          content?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          opened_at?: string | null
          response_date?: string | null
          response_received?: boolean | null
          sent_by?: string | null
          sent_date?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          channel?: string | null
          clicked_at?: string | null
          communication_type?: string
          company_id?: string
          content?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          opened_at?: string | null
          response_date?: string | null
          response_received?: boolean | null
          sent_by?: string | null
          sent_date?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_communications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_contacts: {
        Row: {
          company_id: string
          created_at: string
          department: string
          email: string | null
          function: string | null
          id: string
          is_primary: boolean | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          department: string
          email?: string | null
          function?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          department?: string
          email?: string | null
          function?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_documents: {
        Row: {
          company_id: string
          created_at: string
          document_name: string
          document_type: string
          expiry_date: string | null
          file_size: number | null
          file_url: string | null
          id: string
          issue_date: string | null
          notes: string | null
          status: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_evaluations: {
        Row: {
          company_id: string
          created_at: string
          engagement_rating: number | null
          evaluation_date: string
          evaluation_type: string | null
          evaluator_id: string | null
          evaluator_name: string | null
          export_performance_score: number | null
          financial_health_rating: number | null
          id: string
          management_rating: number | null
          next_evaluation_date: string | null
          notes: string | null
          opportunities: string | null
          overall_score: number | null
          production_capacity_rating: number | null
          quality_rating: number | null
          recommendations: string | null
          strengths: string | null
          threats: string | null
          weaknesses: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          engagement_rating?: number | null
          evaluation_date: string
          evaluation_type?: string | null
          evaluator_id?: string | null
          evaluator_name?: string | null
          export_performance_score?: number | null
          financial_health_rating?: number | null
          id?: string
          management_rating?: number | null
          next_evaluation_date?: string | null
          notes?: string | null
          opportunities?: string | null
          overall_score?: number | null
          production_capacity_rating?: number | null
          quality_rating?: number | null
          recommendations?: string | null
          strengths?: string | null
          threats?: string | null
          weaknesses?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          engagement_rating?: number | null
          evaluation_date?: string
          evaluation_type?: string | null
          evaluator_id?: string | null
          evaluator_name?: string | null
          export_performance_score?: number | null
          financial_health_rating?: number | null
          id?: string
          management_rating?: number | null
          next_evaluation_date?: string | null
          notes?: string | null
          opportunities?: string | null
          overall_score?: number | null
          production_capacity_rating?: number | null
          quality_rating?: number | null
          recommendations?: string | null
          strengths?: string | null
          threats?: string | null
          weaknesses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_evaluations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_export_kpis: {
        Row: {
          average_payment_delay_days: number | null
          client_retention_rate: number | null
          company_id: string
          complaint_rate: number | null
          contracts_value: number | null
          created_at: string
          created_by: string | null
          export_turnover: number | null
          export_volume: number | null
          fiscal_year: number
          id: string
          new_clients: number | null
          new_markets: number | null
          notes: string | null
          number_of_clients: number | null
          number_of_contracts: number | null
          number_of_markets: number | null
          period: string | null
          updated_at: string
        }
        Insert: {
          average_payment_delay_days?: number | null
          client_retention_rate?: number | null
          company_id: string
          complaint_rate?: number | null
          contracts_value?: number | null
          created_at?: string
          created_by?: string | null
          export_turnover?: number | null
          export_volume?: number | null
          fiscal_year: number
          id?: string
          new_clients?: number | null
          new_markets?: number | null
          notes?: string | null
          number_of_clients?: number | null
          number_of_contracts?: number | null
          number_of_markets?: number | null
          period?: string | null
          updated_at?: string
        }
        Update: {
          average_payment_delay_days?: number | null
          client_retention_rate?: number | null
          company_id?: string
          complaint_rate?: number | null
          contracts_value?: number | null
          created_at?: string
          created_by?: string | null
          export_turnover?: number | null
          export_volume?: number | null
          fiscal_year?: number
          id?: string
          new_clients?: number | null
          new_markets?: number | null
          notes?: string | null
          number_of_clients?: number | null
          number_of_contracts?: number | null
          number_of_markets?: number | null
          period?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_export_kpis_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_export_markets: {
        Row: {
          annual_value: number | null
          annual_volume: number | null
          barriers_encountered: string | null
          company_id: string
          country: string
          created_at: string
          currency: string | null
          entry_date: string | null
          id: string
          main_clients: string[] | null
          market_share_percent: number | null
          market_type: string | null
          notes: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          annual_value?: number | null
          annual_volume?: number | null
          barriers_encountered?: string | null
          company_id: string
          country: string
          created_at?: string
          currency?: string | null
          entry_date?: string | null
          id?: string
          main_clients?: string[] | null
          market_share_percent?: number | null
          market_type?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          annual_value?: number | null
          annual_volume?: number | null
          barriers_encountered?: string | null
          company_id?: string
          country?: string
          created_at?: string
          currency?: string | null
          entry_date?: string | null
          id?: string
          main_clients?: string[] | null
          market_share_percent?: number | null
          market_type?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_export_markets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_leadership_history: {
        Row: {
          company_id: string
          created_at: string
          end_date: string | null
          id: string
          leader_name: string
          notes: string | null
          position: string
          reason_for_change: string | null
          start_date: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          leader_name: string
          notes?: string | null
          position: string
          reason_for_change?: string | null
          start_date?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          leader_name?: string
          notes?: string | null
          position?: string
          reason_for_change?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_leadership_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
      company_products: {
        Row: {
          available_quantity: number | null
          category: string | null
          company_id: string
          created_at: string
          currency: string | null
          description: string | null
          hs_code: string | null
          id: string
          is_exported: boolean | null
          is_featured: boolean | null
          is_new_development: boolean | null
          min_order_quantity: number | null
          photo_url: string | null
          price_cif: number | null
          price_fob: number | null
          product_code: string | null
          product_name: string
          product_range: string | null
          production_capacity: number | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          available_quantity?: number | null
          category?: string | null
          company_id: string
          created_at?: string
          currency?: string | null
          description?: string | null
          hs_code?: string | null
          id?: string
          is_exported?: boolean | null
          is_featured?: boolean | null
          is_new_development?: boolean | null
          min_order_quantity?: number | null
          photo_url?: string | null
          price_cif?: number | null
          price_fob?: number | null
          product_code?: string | null
          product_name: string
          product_range?: string | null
          production_capacity?: number | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          available_quantity?: number | null
          category?: string | null
          company_id?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          hs_code?: string | null
          id?: string
          is_exported?: boolean | null
          is_featured?: boolean | null
          is_new_development?: boolean | null
          min_order_quantity?: number | null
          photo_url?: string | null
          price_cif?: number | null
          price_fob?: number | null
          product_code?: string | null
          product_name?: string
          product_range?: string | null
          production_capacity?: number | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_program_participations: {
        Row: {
          benefits_obtained: string | null
          company_id: string
          contacts_made: number | null
          contract_value: number | null
          contracts_signed: number | null
          created_at: string
          feedback: string | null
          id: string
          notes: string | null
          participation_date: string | null
          program_id: string | null
          program_name: string
          program_type: string
          rating: number | null
          role: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          benefits_obtained?: string | null
          company_id: string
          contacts_made?: number | null
          contract_value?: number | null
          contracts_signed?: number | null
          created_at?: string
          feedback?: string | null
          id?: string
          notes?: string | null
          participation_date?: string | null
          program_id?: string | null
          program_name: string
          program_type: string
          rating?: number | null
          role?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          benefits_obtained?: string | null
          company_id?: string
          contacts_made?: number | null
          contract_value?: number | null
          contracts_signed?: number | null
          created_at?: string
          feedback?: string | null
          id?: string
          notes?: string | null
          participation_date?: string | null
          program_id?: string | null
          program_name?: string
          program_type?: string
          rating?: number | null
          role?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_program_participations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_risks: {
        Row: {
          company_id: string
          created_at: string
          id: string
          identified_date: string | null
          impact: string | null
          mitigation_actions: string | null
          notes: string | null
          probability: string | null
          resolved_date: string | null
          responsible_id: string | null
          risk_description: string
          risk_level: string | null
          risk_type: string
          status: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          identified_date?: string | null
          impact?: string | null
          mitigation_actions?: string | null
          notes?: string | null
          probability?: string | null
          resolved_date?: string | null
          responsible_id?: string | null
          risk_description: string
          risk_level?: string | null
          risk_type: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          identified_date?: string | null
          impact?: string | null
          mitigation_actions?: string | null
          notes?: string | null
          probability?: string | null
          resolved_date?: string | null
          responsible_id?: string | null
          risk_description?: string
          risk_level?: string | null
          risk_type?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_risks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_saved_filters: {
        Row: {
          created_at: string
          filter_config: Json
          filter_name: string
          id: string
          is_default: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filter_config: Json
          filter_name: string
          id?: string
          is_default?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filter_config?: Json
          filter_name?: string
          id?: string
          is_default?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      company_sites: {
        Row: {
          address: string | null
          city: string | null
          company_id: string
          created_at: string
          description: string | null
          gps_latitude: number | null
          gps_longitude: number | null
          id: string
          is_active: boolean | null
          region: string | null
          site_name: string
          site_type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          is_active?: boolean | null
          region?: string | null
          site_name: string
          site_type?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          is_active?: boolean | null
          region?: string | null
          site_name?: string
          site_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_sites_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_success_stories: {
        Row: {
          authorization_date: string | null
          authorized_by: string | null
          company_id: string
          content: string
          contract_total_value: number | null
          contracts_concluded: number | null
          created_at: string
          created_by: string | null
          export_increase_percent: number | null
          id: string
          is_published: boolean | null
          jobs_created: number | null
          key_results: Json | null
          media_urls: string[] | null
          new_markets_entered: string[] | null
          publication_authorized: boolean | null
          story_title: string
          story_type: string | null
          testimonial_author: string | null
          testimonial_date: string | null
          testimonial_text: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          authorization_date?: string | null
          authorized_by?: string | null
          company_id: string
          content: string
          contract_total_value?: number | null
          contracts_concluded?: number | null
          created_at?: string
          created_by?: string | null
          export_increase_percent?: number | null
          id?: string
          is_published?: boolean | null
          jobs_created?: number | null
          key_results?: Json | null
          media_urls?: string[] | null
          new_markets_entered?: string[] | null
          publication_authorized?: boolean | null
          story_title: string
          story_type?: string | null
          testimonial_author?: string | null
          testimonial_date?: string | null
          testimonial_text?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          authorization_date?: string | null
          authorized_by?: string | null
          company_id?: string
          content?: string
          contract_total_value?: number | null
          contracts_concluded?: number | null
          created_at?: string
          created_by?: string | null
          export_increase_percent?: number | null
          id?: string
          is_published?: boolean | null
          jobs_created?: number | null
          key_results?: Json | null
          media_urls?: string[] | null
          new_markets_entered?: string[] | null
          publication_authorized?: boolean | null
          story_title?: string
          story_type?: string | null
          testimonial_author?: string | null
          testimonial_date?: string | null
          testimonial_text?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_success_stories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      corrective_actions: {
        Row: {
          completion_date: string | null
          created_at: string
          created_by: string | null
          description: string | null
          direction_id: string | null
          due_date: string | null
          effectiveness_notes: string | null
          effectiveness_rating: number | null
          gap_analysis_id: string | null
          id: string
          priority: string | null
          responsible_name: string | null
          responsible_user_id: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id?: string | null
          due_date?: string | null
          effectiveness_notes?: string | null
          effectiveness_rating?: number | null
          gap_analysis_id?: string | null
          id?: string
          priority?: string | null
          responsible_name?: string | null
          responsible_user_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id?: string | null
          due_date?: string | null
          effectiveness_notes?: string | null
          effectiveness_rating?: number | null
          gap_analysis_id?: string | null
          id?: string
          priority?: string | null
          responsible_name?: string | null
          responsible_user_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "corrective_actions_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrective_actions_gap_analysis_id_fkey"
            columns: ["gap_analysis_id"]
            isOneToOne: false
            referencedRelation: "gap_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_widgets: {
        Row: {
          configuration: Json | null
          created_at: string
          direction_id: string | null
          height: number | null
          id: string
          is_active: boolean | null
          position_x: number | null
          position_y: number | null
          title: string
          updated_at: string
          user_id: string
          widget_type: string
          width: number | null
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          direction_id?: string | null
          height?: number | null
          id?: string
          is_active?: boolean | null
          position_x?: number | null
          position_y?: number | null
          title: string
          updated_at?: string
          user_id: string
          widget_type: string
          width?: number | null
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          direction_id?: string | null
          height?: number | null
          id?: string
          is_active?: boolean | null
          position_x?: number | null
          position_y?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          widget_type?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_widgets_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
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
      discovered_events: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          end_date: string | null
          event_type: string | null
          id: string
          notes: string | null
          relevance_score: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          sectors: string[] | null
          source: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string
          venue: string | null
          website: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          notes?: string | null
          relevance_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sectors?: string[] | null
          source?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string
          venue?: string | null
          website?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          notes?: string | null
          relevance_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sectors?: string[] | null
          source?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          venue?: string | null
          website?: string | null
        }
        Relationships: []
      }
      document_shares: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          permission_level: string
          shared_by: string
          shared_with: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          permission_level?: string
          shared_by: string
          shared_with: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          permission_level?: string
          shared_by?: string
          shared_with?: string
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
      employees: {
        Row: {
          address: string | null
          birth_date: string | null
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at: string
          direction_id: string | null
          email: string
          emergency_contact: string | null
          employee_number: string
          first_name: string
          hire_date: string
          id: string
          last_name: string
          manager_id: string | null
          notes: string | null
          phone: string | null
          position: string
          salary: number | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          direction_id?: string | null
          email: string
          emergency_contact?: string | null
          employee_number: string
          first_name: string
          hire_date: string
          id?: string
          last_name: string
          manager_id?: string | null
          notes?: string | null
          phone?: string | null
          position: string
          salary?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          direction_id?: string | null
          email?: string
          emergency_contact?: string | null
          employee_number?: string
          first_name?: string
          hire_date?: string
          id?: string
          last_name?: string
          manager_id?: string | null
          notes?: string | null
          phone?: string | null
          position?: string
          salary?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      equipments: {
        Row: {
          assigned_to: string | null
          brand: string | null
          created_at: string
          direction_id: string | null
          equipment_type: string
          id: string
          location: string | null
          model: string | null
          name: string
          notes: string | null
          purchase_date: string | null
          serial_number: string | null
          status: string
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          assigned_to?: string | null
          brand?: string | null
          created_at?: string
          direction_id?: string | null
          equipment_type: string
          id?: string
          location?: string | null
          model?: string | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          assigned_to?: string | null
          brand?: string | null
          created_at?: string
          direction_id?: string | null
          equipment_type?: string
          id?: string
          location?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipments_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_reports: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          content: Json | null
          created_at: string
          created_by: string | null
          direction_id: string | null
          file_url: string | null
          id: string
          key_findings: string | null
          period_end: string
          period_start: string
          recommendations: string | null
          report_type: string
          status: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          content?: Json | null
          created_at?: string
          created_by?: string | null
          direction_id?: string | null
          file_url?: string | null
          id?: string
          key_findings?: string | null
          period_end: string
          period_start: string
          recommendations?: string | null
          report_type: string
          status?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          content?: Json | null
          created_at?: string
          created_by?: string | null
          direction_id?: string | null
          file_url?: string | null
          id?: string
          key_findings?: string | null
          period_end?: string
          period_start?: string
          recommendations?: string | null
          report_type?: string
          status?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_reports_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
        ]
      }
      event_budget_items: {
        Row: {
          actual_amount: number | null
          category: string
          created_at: string
          currency: string | null
          description: string | null
          estimated_amount: number | null
          event_id: string
          id: string
          invoice_number: string | null
          invoice_url: string | null
          item_name: string
          notes: string | null
          status: string | null
          updated_at: string
          vendor: string | null
        }
        Insert: {
          actual_amount?: number | null
          category: string
          created_at?: string
          currency?: string | null
          description?: string | null
          estimated_amount?: number | null
          event_id: string
          id?: string
          invoice_number?: string | null
          invoice_url?: string | null
          item_name: string
          notes?: string | null
          status?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          actual_amount?: number | null
          category?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          estimated_amount?: number | null
          event_id?: string
          id?: string
          invoice_number?: string | null
          invoice_url?: string | null
          item_name?: string
          notes?: string | null
          status?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_budget_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_catering: {
        Row: {
          caterer_contact: string | null
          caterer_name: string | null
          cost: number | null
          created_at: string
          currency: string | null
          dietary_options: string[] | null
          event_id: string
          expected_count: number | null
          id: string
          menu_description: string | null
          notes: string | null
          service_date: string
          service_time: string | null
          service_type: string
          status: string | null
          updated_at: string
        }
        Insert: {
          caterer_contact?: string | null
          caterer_name?: string | null
          cost?: number | null
          created_at?: string
          currency?: string | null
          dietary_options?: string[] | null
          event_id: string
          expected_count?: number | null
          id?: string
          menu_description?: string | null
          notes?: string | null
          service_date: string
          service_time?: string | null
          service_type: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          caterer_contact?: string | null
          caterer_name?: string | null
          cost?: number | null
          created_at?: string
          currency?: string | null
          dietary_options?: string[] | null
          event_id?: string
          expected_count?: number | null
          id?: string
          menu_description?: string | null
          notes?: string | null
          service_date?: string
          service_time?: string | null
          service_type?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_catering_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_documents: {
        Row: {
          created_at: string
          description: string | null
          document_type: string
          event_id: string
          file_size: number | null
          file_url: string | null
          id: string
          is_public: boolean | null
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_type: string
          event_id: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          document_type?: string
          event_id?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_documents_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_logistics: {
        Row: {
          assigned_to: string | null
          category: string
          completed: boolean | null
          created_at: string
          description: string | null
          due_date: string | null
          event_id: string
          id: string
          item_name: string
          notes: string | null
          quantity: number | null
          status: string | null
          updated_at: string
          vendor: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          completed?: boolean | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          event_id: string
          id?: string
          item_name: string
          notes?: string | null
          quantity?: number | null
          status?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          completed?: boolean | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          event_id?: string
          id?: string
          item_name?: string
          notes?: string | null
          quantity?: number | null
          status?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_logistics_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_notifications: {
        Row: {
          created_at: string
          created_by: string | null
          event_id: string
          id: string
          message: string
          notification_type: string
          recipients_count: number | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_id: string
          id?: string
          message: string
          notification_type: string
          recipients_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_id?: string
          id?: string
          message?: string
          notification_type?: string
          recipients_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          accessibility_needs: string | null
          badge_number: string | null
          badge_printed: boolean | null
          category: string | null
          certificate_sent: boolean | null
          certificate_url: string | null
          check_in_time: string | null
          check_out_time: string | null
          company_id: string
          created_at: string
          created_by: string | null
          dietary_requirements: string | null
          event_id: string
          hotel_reservation: boolean | null
          id: string
          notes: string | null
          payment_amount: number | null
          payment_status: string | null
          qr_code: string | null
          registration_date: string
          status: string
          transport_needed: boolean | null
          updated_at: string
          waitlist_position: number | null
        }
        Insert: {
          accessibility_needs?: string | null
          badge_number?: string | null
          badge_printed?: boolean | null
          category?: string | null
          certificate_sent?: boolean | null
          certificate_url?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          dietary_requirements?: string | null
          event_id: string
          hotel_reservation?: boolean | null
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          qr_code?: string | null
          registration_date?: string
          status?: string
          transport_needed?: boolean | null
          updated_at?: string
          waitlist_position?: number | null
        }
        Update: {
          accessibility_needs?: string | null
          badge_number?: string | null
          badge_printed?: boolean | null
          category?: string | null
          certificate_sent?: boolean | null
          certificate_url?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          dietary_requirements?: string | null
          event_id?: string
          hotel_reservation?: boolean | null
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          qr_code?: string | null
          registration_date?: string
          status?: string
          transport_needed?: boolean | null
          updated_at?: string
          waitlist_position?: number | null
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
      event_projects: {
        Row: {
          created_at: string
          event_id: string
          id: string
          project_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          project_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_projects_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reports: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          event_id: string
          file_url: string | null
          financial_summary: Json | null
          id: string
          improvements: string | null
          key_statistics: Json | null
          lessons_learned: string | null
          media_urls: string[] | null
          objectives_achieved: string | null
          recommendations: string | null
          report_type: string | null
          status: string | null
          strengths: string | null
          summary: string | null
          testimonials: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          event_id: string
          file_url?: string | null
          financial_summary?: Json | null
          id?: string
          improvements?: string | null
          key_statistics?: Json | null
          lessons_learned?: string | null
          media_urls?: string[] | null
          objectives_achieved?: string | null
          recommendations?: string | null
          report_type?: string | null
          status?: string | null
          strengths?: string | null
          summary?: string | null
          testimonials?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          event_id?: string
          file_url?: string | null
          financial_summary?: Json | null
          id?: string
          improvements?: string | null
          key_statistics?: Json | null
          lessons_learned?: string | null
          media_urls?: string[] | null
          objectives_achieved?: string | null
          recommendations?: string | null
          report_type?: string | null
          status?: string | null
          strengths?: string | null
          summary?: string | null
          testimonials?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_reports_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_session_attendance: {
        Row: {
          attended: boolean | null
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          id: string
          notes: string | null
          participant_id: string
          session_id: string
        }
        Insert: {
          attended?: boolean | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          participant_id: string
          session_id: string
        }
        Update: {
          attended?: boolean | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          participant_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_session_attendance_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "event_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_session_attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "event_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sessions: {
        Row: {
          created_at: string
          day_number: number | null
          description: string | null
          end_time: string
          event_id: string
          id: string
          is_break: boolean | null
          is_parallel: boolean | null
          materials_url: string | null
          max_attendees: number | null
          room: string | null
          session_date: string
          session_type: string | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_number?: number | null
          description?: string | null
          end_time: string
          event_id: string
          id?: string
          is_break?: boolean | null
          is_parallel?: boolean | null
          materials_url?: string | null
          max_attendees?: number | null
          room?: string | null
          session_date: string
          session_type?: string | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_number?: number | null
          description?: string | null
          end_time?: string
          event_id?: string
          id?: string
          is_break?: boolean | null
          is_parallel?: boolean | null
          materials_url?: string | null
          max_attendees?: number | null
          room?: string | null
          session_date?: string
          session_type?: string | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_sessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_speakers: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          event_id: string
          id: string
          is_keynote: boolean | null
          linkedin_url: string | null
          name: string
          organization: string | null
          phone: string | null
          photo_url: string | null
          session_id: string | null
          title: string | null
          topics: string[] | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          event_id: string
          id?: string
          is_keynote?: boolean | null
          linkedin_url?: string | null
          name: string
          organization?: string | null
          phone?: string | null
          photo_url?: string | null
          session_id?: string | null
          title?: string | null
          topics?: string[] | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          event_id?: string
          id?: string
          is_keynote?: boolean | null
          linkedin_url?: string | null
          name?: string
          organization?: string | null
          phone?: string | null
          photo_url?: string | null
          session_id?: string | null
          title?: string | null
          topics?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_speakers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_speakers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "event_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sponsors: {
        Row: {
          benefits_offered: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contribution_type: string | null
          contribution_value: number | null
          created_at: string
          currency: string | null
          event_id: string
          id: string
          is_media_partner: boolean | null
          logo_url: string | null
          name: string
          notes: string | null
          sponsor_level: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          benefits_offered?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contribution_type?: string | null
          contribution_value?: number | null
          created_at?: string
          currency?: string | null
          event_id: string
          id?: string
          is_media_partner?: boolean | null
          logo_url?: string | null
          name: string
          notes?: string | null
          sponsor_level?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          benefits_offered?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contribution_type?: string | null
          contribution_value?: number | null
          created_at?: string
          currency?: string | null
          event_id?: string
          id?: string
          is_media_partner?: boolean | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          sponsor_level?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_sponsors_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_surveys: {
        Row: {
          comments: string | null
          content_rating: number | null
          created_at: string
          event_id: string
          id: string
          logistics_rating: number | null
          organization_rating: number | null
          overall_rating: number | null
          participant_id: string | null
          speakers_rating: number | null
          submitted_at: string
          suggestions: string | null
          venue_rating: number | null
          would_recommend: boolean | null
        }
        Insert: {
          comments?: string | null
          content_rating?: number | null
          created_at?: string
          event_id: string
          id?: string
          logistics_rating?: number | null
          organization_rating?: number | null
          overall_rating?: number | null
          participant_id?: string | null
          speakers_rating?: number | null
          submitted_at?: string
          suggestions?: string | null
          venue_rating?: number | null
          would_recommend?: boolean | null
        }
        Update: {
          comments?: string | null
          content_rating?: number | null
          created_at?: string
          event_id?: string
          id?: string
          logistics_rating?: number | null
          organization_rating?: number | null
          overall_rating?: number | null
          participant_id?: string | null
          speakers_rating?: number | null
          submitted_at?: string
          suggestions?: string | null
          venue_rating?: number | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "event_surveys_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_surveys_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "event_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      event_team_members: {
        Row: {
          created_at: string
          email: string | null
          event_id: string
          id: string
          is_external: boolean | null
          name: string
          notes: string | null
          organization: string | null
          phone: string | null
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          event_id: string
          id?: string
          is_external?: boolean | null
          name: string
          notes?: string | null
          organization?: string | null
          phone?: string | null
          role: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          event_id?: string
          id?: string
          is_external?: boolean | null
          name?: string
          notes?: string | null
          organization?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_team_members_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          access_instructions: string | null
          b2b_meetings: number | null
          budget_actual: number | null
          budget_estimated: number | null
          capacity: number | null
          city: string | null
          contracts_value: number | null
          country: string | null
          created_at: string
          created_by: string | null
          description: string | null
          direction_id: string
          end_date: string
          end_time: string | null
          event_type: string
          full_address: string | null
          hashtag: string | null
          id: string
          is_registration_open: boolean | null
          leads_generated: number | null
          location: string | null
          location_type: string | null
          max_participants: number | null
          media_coverage_value: number | null
          objectives: string | null
          press_release_url: string | null
          program_pdf_url: string | null
          project_manager_id: string | null
          recurrence_end_date: string | null
          recurrence_type: string | null
          registration_deadline: string | null
          registration_link: string | null
          require_approval: boolean | null
          roi_percentage: number | null
          satisfaction_score: number | null
          sectors: string[] | null
          social_media_links: Json | null
          start_date: string
          start_time: string | null
          status: string | null
          target_audience: string | null
          timezone: string | null
          title: string
          total_participants_actual: number | null
          updated_at: string
          venue: string | null
          venue_map_url: string | null
          video_link: string | null
          waitlist_enabled: boolean | null
        }
        Insert: {
          access_instructions?: string | null
          b2b_meetings?: number | null
          budget_actual?: number | null
          budget_estimated?: number | null
          capacity?: number | null
          city?: string | null
          contracts_value?: number | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id: string
          end_date: string
          end_time?: string | null
          event_type: string
          full_address?: string | null
          hashtag?: string | null
          id?: string
          is_registration_open?: boolean | null
          leads_generated?: number | null
          location?: string | null
          location_type?: string | null
          max_participants?: number | null
          media_coverage_value?: number | null
          objectives?: string | null
          press_release_url?: string | null
          program_pdf_url?: string | null
          project_manager_id?: string | null
          recurrence_end_date?: string | null
          recurrence_type?: string | null
          registration_deadline?: string | null
          registration_link?: string | null
          require_approval?: boolean | null
          roi_percentage?: number | null
          satisfaction_score?: number | null
          sectors?: string[] | null
          social_media_links?: Json | null
          start_date: string
          start_time?: string | null
          status?: string | null
          target_audience?: string | null
          timezone?: string | null
          title: string
          total_participants_actual?: number | null
          updated_at?: string
          venue?: string | null
          venue_map_url?: string | null
          video_link?: string | null
          waitlist_enabled?: boolean | null
        }
        Update: {
          access_instructions?: string | null
          b2b_meetings?: number | null
          budget_actual?: number | null
          budget_estimated?: number | null
          capacity?: number | null
          city?: string | null
          contracts_value?: number | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id?: string
          end_date?: string
          end_time?: string | null
          event_type?: string
          full_address?: string | null
          hashtag?: string | null
          id?: string
          is_registration_open?: boolean | null
          leads_generated?: number | null
          location?: string | null
          location_type?: string | null
          max_participants?: number | null
          media_coverage_value?: number | null
          objectives?: string | null
          press_release_url?: string | null
          program_pdf_url?: string | null
          project_manager_id?: string | null
          recurrence_end_date?: string | null
          recurrence_type?: string | null
          registration_deadline?: string | null
          registration_link?: string | null
          require_approval?: boolean | null
          roi_percentage?: number | null
          satisfaction_score?: number | null
          sectors?: string[] | null
          social_media_links?: Json | null
          start_date?: string
          start_time?: string | null
          status?: string | null
          target_audience?: string | null
          timezone?: string | null
          title?: string
          total_participants_actual?: number | null
          updated_at?: string
          venue?: string | null
          venue_map_url?: string | null
          video_link?: string | null
          waitlist_enabled?: boolean | null
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
      export_performance_kpis: {
        Row: {
          b2b_connections_made: number | null
          buyers_contacted: number | null
          conversion_rate: number | null
          created_at: string
          currency: string | null
          direction_id: string | null
          id: string
          mission_participants: number | null
          missions_organized: number | null
          new_markets_accessed: number | null
          notes: string | null
          opportunities_concluded: number | null
          opportunities_identified: number | null
          opportunities_shared: number | null
          period: string
          successful_connections: number | null
          top_countries: string[] | null
          top_sectors: string[] | null
          total_contract_value: number | null
          updated_at: string
        }
        Insert: {
          b2b_connections_made?: number | null
          buyers_contacted?: number | null
          conversion_rate?: number | null
          created_at?: string
          currency?: string | null
          direction_id?: string | null
          id?: string
          mission_participants?: number | null
          missions_organized?: number | null
          new_markets_accessed?: number | null
          notes?: string | null
          opportunities_concluded?: number | null
          opportunities_identified?: number | null
          opportunities_shared?: number | null
          period: string
          successful_connections?: number | null
          top_countries?: string[] | null
          top_sectors?: string[] | null
          total_contract_value?: number | null
          updated_at?: string
        }
        Update: {
          b2b_connections_made?: number | null
          buyers_contacted?: number | null
          conversion_rate?: number | null
          created_at?: string
          currency?: string | null
          direction_id?: string | null
          id?: string
          mission_participants?: number | null
          missions_organized?: number | null
          new_markets_accessed?: number | null
          notes?: string | null
          opportunities_concluded?: number | null
          opportunities_identified?: number | null
          opportunities_shared?: number | null
          period?: string
          successful_connections?: number | null
          top_countries?: string[] | null
          top_sectors?: string[] | null
          total_contract_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "export_performance_kpis_direction_id_fkey"
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
      gap_analyses: {
        Row: {
          actual_value: number
          analysis_period: string
          created_at: string
          created_by: string | null
          direction_id: string | null
          expected_value: number
          external_factors: string | null
          gap_percentage: number | null
          gap_type: string | null
          gap_value: number | null
          id: string
          impact_assessment: string | null
          internal_factors: string | null
          kpi_id: string | null
          lessons_learned: string | null
          objective_id: string | null
          root_cause_analysis: string | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_value: number
          analysis_period: string
          created_at?: string
          created_by?: string | null
          direction_id?: string | null
          expected_value: number
          external_factors?: string | null
          gap_percentage?: number | null
          gap_type?: string | null
          gap_value?: number | null
          id?: string
          impact_assessment?: string | null
          internal_factors?: string | null
          kpi_id?: string | null
          lessons_learned?: string | null
          objective_id?: string | null
          root_cause_analysis?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_value?: number
          analysis_period?: string
          created_at?: string
          created_by?: string | null
          direction_id?: string | null
          expected_value?: number
          external_factors?: string | null
          gap_percentage?: number | null
          gap_type?: string | null
          gap_value?: number | null
          id?: string
          impact_assessment?: string | null
          internal_factors?: string | null
          kpi_id?: string | null
          lessons_learned?: string | null
          objective_id?: string | null
          root_cause_analysis?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gap_analyses_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gap_analyses_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpi_tracking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gap_analyses_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "strategic_objectives"
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
          assigned_to: string | null
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
          assigned_to?: string | null
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
          assigned_to?: string | null
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
      international_buyers: {
        Row: {
          certifications_required: string[] | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string
          created_at: string
          created_by: string | null
          direction_id: string | null
          id: string
          last_contact_date: string | null
          notes: string | null
          organization_name: string
          payment_terms: string | null
          position: string | null
          preferred_incoterms: string | null
          products_interested: string[] | null
          purchase_frequency: string | null
          purchase_volume: string | null
          quality_requirements: string | null
          region: string | null
          sector: string
          status: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          certifications_required?: string[] | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country: string
          created_at?: string
          created_by?: string | null
          direction_id?: string | null
          id?: string
          last_contact_date?: string | null
          notes?: string | null
          organization_name: string
          payment_terms?: string | null
          position?: string | null
          preferred_incoterms?: string | null
          products_interested?: string[] | null
          purchase_frequency?: string | null
          purchase_volume?: string | null
          quality_requirements?: string | null
          region?: string | null
          sector: string
          status?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          certifications_required?: string[] | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          direction_id?: string | null
          id?: string
          last_contact_date?: string | null
          notes?: string | null
          organization_name?: string
          payment_terms?: string | null
          position?: string | null
          preferred_incoterms?: string | null
          products_interested?: string[] | null
          purchase_frequency?: string | null
          purchase_volume?: string | null
          quality_requirements?: string | null
          region?: string | null
          sector?: string
          status?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "international_buyers_direction_id_fkey"
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
      leave_requests: {
        Row: {
          approval_date: string | null
          approved_by: string | null
          created_at: string
          employee_id: string
          end_date: string
          id: string
          leave_type: Database["public"]["Enums"]["leave_type"]
          notes: string | null
          reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_status"]
          total_days: number
          updated_at: string
        }
        Insert: {
          approval_date?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id: string
          end_date: string
          id?: string
          leave_type: Database["public"]["Enums"]["leave_type"]
          notes?: string | null
          reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"]
          total_days: number
          updated_at?: string
        }
        Update: {
          approval_date?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: Database["public"]["Enums"]["leave_type"]
          notes?: string | null
          reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"]
          total_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
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
      market_country_analysis: {
        Row: {
          ci_export_potential: string | null
          country: string
          created_at: string
          created_by: string | null
          currency: string | null
          ease_of_business_rank: number | null
          gdp_billion: number | null
          gdp_growth_percent: number | null
          id: string
          import_value_billion: number | null
          inflation_percent: number | null
          key_contacts: string | null
          last_updated: string | null
          main_imports: string[] | null
          main_trading_partners: string[] | null
          market_challenges: string | null
          market_opportunities: string | null
          non_tariff_barriers: string | null
          notes: string | null
          official_languages: string[] | null
          population: number | null
          recommended_sectors: string[] | null
          region: string | null
          tariff_average_percent: number | null
          trade_agreements: string[] | null
          updated_at: string
          useful_resources: string[] | null
        }
        Insert: {
          ci_export_potential?: string | null
          country: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          ease_of_business_rank?: number | null
          gdp_billion?: number | null
          gdp_growth_percent?: number | null
          id?: string
          import_value_billion?: number | null
          inflation_percent?: number | null
          key_contacts?: string | null
          last_updated?: string | null
          main_imports?: string[] | null
          main_trading_partners?: string[] | null
          market_challenges?: string | null
          market_opportunities?: string | null
          non_tariff_barriers?: string | null
          notes?: string | null
          official_languages?: string[] | null
          population?: number | null
          recommended_sectors?: string[] | null
          region?: string | null
          tariff_average_percent?: number | null
          trade_agreements?: string[] | null
          updated_at?: string
          useful_resources?: string[] | null
        }
        Update: {
          ci_export_potential?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          ease_of_business_rank?: number | null
          gdp_billion?: number | null
          gdp_growth_percent?: number | null
          id?: string
          import_value_billion?: number | null
          inflation_percent?: number | null
          key_contacts?: string | null
          last_updated?: string | null
          main_imports?: string[] | null
          main_trading_partners?: string[] | null
          market_challenges?: string | null
          market_opportunities?: string | null
          non_tariff_barriers?: string | null
          notes?: string | null
          official_languages?: string[] | null
          population?: number | null
          recommended_sectors?: string[] | null
          region?: string | null
          tariff_average_percent?: number | null
          trade_agreements?: string[] | null
          updated_at?: string
          useful_resources?: string[] | null
        }
        Relationships: []
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
      media_albums: {
        Row: {
          access_level: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          direction_id: string | null
          event_id: string | null
          id: string
          is_public: boolean | null
          name: string
          parent_id: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          access_level?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id?: string | null
          event_id?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          access_level?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id?: string | null
          event_id?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_albums_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_albums_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_albums_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "media_albums"
            referencedColumns: ["id"]
          },
        ]
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
      media_downloads: {
        Row: {
          downloaded_at: string
          id: string
          ip_address: string | null
          media_file_id: string
          resolution: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          downloaded_at?: string
          id?: string
          ip_address?: string | null
          media_file_id: string
          resolution?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          downloaded_at?: string
          id?: string
          ip_address?: string | null
          media_file_id?: string
          resolution?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_downloads_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      media_favorites: {
        Row: {
          created_at: string
          id: string
          media_file_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_file_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_file_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_favorites_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      media_file_tags: {
        Row: {
          created_at: string
          id: string
          media_file_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_file_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_file_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_file_tags_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_file_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "media_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      media_files: {
        Row: {
          album_id: string | null
          author: string | null
          capture_date: string | null
          copyright_holder: string | null
          created_at: string
          created_by: string | null
          credit_required: boolean | null
          description: string | null
          direction_id: string | null
          download_count: number | null
          duration_seconds: number | null
          event_id: string | null
          exif_data: Json | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          height: number | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          license_type: string | null
          location_city: string | null
          location_country: string | null
          location_venue: string | null
          media_category: string | null
          mime_type: string | null
          photographer: string | null
          preview_url: string | null
          resolution: string | null
          share_expires_at: string | null
          share_password: string | null
          share_token: string | null
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          view_count: number | null
          watermark_applied: boolean | null
          width: number | null
        }
        Insert: {
          album_id?: string | null
          author?: string | null
          capture_date?: string | null
          copyright_holder?: string | null
          created_at?: string
          created_by?: string | null
          credit_required?: boolean | null
          description?: string | null
          direction_id?: string | null
          download_count?: number | null
          duration_seconds?: number | null
          event_id?: string | null
          exif_data?: Json | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          height?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          license_type?: string | null
          location_city?: string | null
          location_country?: string | null
          location_venue?: string | null
          media_category?: string | null
          mime_type?: string | null
          photographer?: string | null
          preview_url?: string | null
          resolution?: string | null
          share_expires_at?: string | null
          share_password?: string | null
          share_token?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          view_count?: number | null
          watermark_applied?: boolean | null
          width?: number | null
        }
        Update: {
          album_id?: string | null
          author?: string | null
          capture_date?: string | null
          copyright_holder?: string | null
          created_at?: string
          created_by?: string | null
          credit_required?: boolean | null
          description?: string | null
          direction_id?: string | null
          download_count?: number | null
          duration_seconds?: number | null
          event_id?: string | null
          exif_data?: Json | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          height?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          license_type?: string | null
          location_city?: string | null
          location_country?: string | null
          location_venue?: string | null
          media_category?: string | null
          mime_type?: string | null
          photographer?: string | null
          preview_url?: string | null
          resolution?: string | null
          share_expires_at?: string | null
          share_password?: string | null
          share_token?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          view_count?: number | null
          watermark_applied?: boolean | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_files_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "media_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_files_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_files_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      media_galleries: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          direction_id: string | null
          gallery_type: string | null
          id: string
          is_published: boolean | null
          name: string
          published_at: string | null
          settings: Json | null
          slug: string | null
          theme: string | null
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id?: string | null
          gallery_type?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          published_at?: string | null
          settings?: Json | null
          slug?: string | null
          theme?: string | null
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id?: string | null
          gallery_type?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          published_at?: string | null
          settings?: Json | null
          slug?: string | null
          theme?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_galleries_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
        ]
      }
      media_gallery_items: {
        Row: {
          caption: string | null
          created_at: string
          gallery_id: string
          id: string
          media_file_id: string
          sort_order: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          gallery_id: string
          id?: string
          media_file_id: string
          sort_order?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          gallery_id?: string
          id?: string
          media_file_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_gallery_items_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "media_galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_gallery_items_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      media_share_links: {
        Row: {
          access_count: number | null
          album_id: string | null
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          max_access_count: number | null
          media_file_id: string | null
          password_hash: string | null
          token: string
        }
        Insert: {
          access_count?: number | null
          album_id?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          max_access_count?: number | null
          media_file_id?: string | null
          password_hash?: string | null
          token: string
        }
        Update: {
          access_count?: number | null
          album_id?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          max_access_count?: number | null
          media_file_id?: string | null
          password_hash?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_share_links_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "media_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_share_links_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      media_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          parent_id: string | null
          usage_count: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          usage_count?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_tags_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "media_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_alerts: {
        Row: {
          alert_message: string
          alert_type: string
          created_at: string | null
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          mission_id: string
          resolved_at: string | null
          target_user_id: string | null
        }
        Insert: {
          alert_message: string
          alert_type: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          mission_id: string
          resolved_at?: string | null
          target_user_id?: string | null
        }
        Update: {
          alert_message?: string
          alert_type?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          mission_id?: string
          resolved_at?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_alerts_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          mission_order_id: string
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
          mission_order_id: string
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
          mission_order_id?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_attachments_mission_order_id_fkey"
            columns: ["mission_order_id"]
            isOneToOne: false
            referencedRelation: "mission_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_expenses: {
        Row: {
          amount: number
          comptable_comments: string | null
          created_at: string | null
          currency: string | null
          description: string
          expense_category: string
          expense_date: string | null
          id: string
          is_justified: boolean | null
          justification_status: string | null
          mission_id: string
          receipt_number: string | null
          receipt_url: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          comptable_comments?: string | null
          created_at?: string | null
          currency?: string | null
          description: string
          expense_category: string
          expense_date?: string | null
          id?: string
          is_justified?: boolean | null
          justification_status?: string | null
          mission_id: string
          receipt_number?: string | null
          receipt_url?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          comptable_comments?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string
          expense_category?: string
          expense_date?: string | null
          id?: string
          is_justified?: boolean | null
          justification_status?: string | null
          mission_id?: string
          receipt_number?: string | null
          receipt_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_expenses_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_itineraries: {
        Row: {
          accommodation: string | null
          arrival_date: string | null
          arrival_location: string
          created_at: string | null
          departure_date: string | null
          departure_location: string
          id: string
          mission_id: string
          notes: string | null
          step_order: number
          transport_details: string | null
          transport_mode: string | null
        }
        Insert: {
          accommodation?: string | null
          arrival_date?: string | null
          arrival_location: string
          created_at?: string | null
          departure_date?: string | null
          departure_location: string
          id?: string
          mission_id: string
          notes?: string | null
          step_order: number
          transport_details?: string | null
          transport_mode?: string | null
        }
        Update: {
          accommodation?: string | null
          arrival_date?: string | null
          arrival_location?: string
          created_at?: string | null
          departure_date?: string | null
          departure_location?: string
          id?: string
          mission_id?: string
          notes?: string | null
          step_order?: number
          transport_details?: string | null
          transport_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_itineraries_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_liquidations: {
        Row: {
          accounting_entry_number: string | null
          advance_received: number | null
          amount_to_refund: number | null
          amount_to_reimburse: number | null
          analytical_code: string | null
          comptable_comments: string | null
          comptable_id: string | null
          comptable_validation_date: string | null
          created_at: string | null
          id: string
          mission_id: string
          payment_date: string | null
          payment_reference: string | null
          status: Database["public"]["Enums"]["liquidation_status"] | null
          total_expenses: number | null
          updated_at: string | null
          variance: number | null
        }
        Insert: {
          accounting_entry_number?: string | null
          advance_received?: number | null
          amount_to_refund?: number | null
          amount_to_reimburse?: number | null
          analytical_code?: string | null
          comptable_comments?: string | null
          comptable_id?: string | null
          comptable_validation_date?: string | null
          created_at?: string | null
          id?: string
          mission_id: string
          payment_date?: string | null
          payment_reference?: string | null
          status?: Database["public"]["Enums"]["liquidation_status"] | null
          total_expenses?: number | null
          updated_at?: string | null
          variance?: number | null
        }
        Update: {
          accounting_entry_number?: string | null
          advance_received?: number | null
          amount_to_refund?: number | null
          amount_to_reimburse?: number | null
          analytical_code?: string | null
          comptable_comments?: string | null
          comptable_id?: string | null
          comptable_validation_date?: string | null
          created_at?: string | null
          id?: string
          mission_id?: string
          payment_date?: string | null
          payment_reference?: string | null
          status?: Database["public"]["Enums"]["liquidation_status"] | null
          total_expenses?: number | null
          updated_at?: string | null
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_liquidations_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_orders: {
        Row: {
          accommodation_cost: number | null
          accounting_entry_ref: string | null
          activities_summary: string | null
          actual_cost: number | null
          actual_departure_date: string | null
          actual_return_date: string | null
          advance_amount: number | null
          advance_currency: string | null
          advance_payment_date: string | null
          advance_payment_mode:
            | Database["public"]["Enums"]["payment_mode"]
            | null
          advance_status: Database["public"]["Enums"]["advance_status"] | null
          advance_transaction_ref: string | null
          agreements_made: string | null
          airline: string | null
          amount_to_refund: number | null
          amount_to_reimburse: number | null
          b2b_contacts_made: number | null
          budget_alert_sent: boolean | null
          budget_available: boolean | null
          budget_line_id: string | null
          budget_variance: number | null
          converted_budget: number | null
          cost_center: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          departure_time: string | null
          destination: string
          destination_cities: string[] | null
          destination_country: string | null
          difficulties_encountered: string | null
          direction_id: string | null
          discussions_summary: string | null
          documents_brought: string[] | null
          driver_name: string | null
          driver_phone: string | null
          duration_days: number
          emergency_contact_local: string | null
          employee_id: string
          end_date: string
          estimated_budget: number | null
          exchange_rate: number | null
          expected_results: string | null
          extended_status:
            | Database["public"]["Enums"]["mission_status_extended"]
            | null
          flight_arrival_time: string | null
          flight_class: string | null
          flight_departure_time: string | null
          flight_number: string | null
          gps_coordinates: Json | null
          hotel_address: string | null
          hotel_check_in: string | null
          hotel_check_out: string | null
          hotel_confirmation_ref: string | null
          hotel_name: string | null
          hotel_nights: number | null
          id: string
          insurance_cost: number | null
          justification: string | null
          liquidation_date: string | null
          liquidation_status:
            | Database["public"]["Enums"]["liquidation_status"]
            | null
          liquidation_transaction_ref: string | null
          liquidation_validated_by: string | null
          local_contact_name: string | null
          local_contact_phone: string | null
          mission_incidents: string | null
          mission_number: string
          mission_type: Database["public"]["Enums"]["mission_type"] | null
          notes: string | null
          objectives_achieved: string | null
          opportunities_identified: string | null
          other_costs: number | null
          passport_alert_sent: boolean | null
          passport_expiry: string | null
          people_met: string | null
          per_diem_amount: number | null
          per_diem_days: number | null
          photos_uploaded: string[] | null
          places_to_visit: string[] | null
          pnr_reference: string | null
          program_changes: string | null
          project_id: string | null
          purpose: string
          recommendations: string | null
          rental_agency: string | null
          rental_vehicle_type: string | null
          report: string | null
          report_due_date: string | null
          report_submitted_date: string | null
          report_validated: boolean | null
          report_validated_by: string | null
          report_validated_date: string | null
          request_date: string | null
          requester_matricule: string | null
          requester_position: string | null
          return_time: string | null
          start_date: string
          status: Database["public"]["Enums"]["mission_status"]
          total_actual_expenses: number | null
          transport_cost: number | null
          travel_insurance_company: string | null
          travel_insurance_number: string | null
          updated_at: string
          urgency_level: Database["public"]["Enums"]["mission_urgency"] | null
          vaccination_card_valid: boolean | null
          vaccinations_required: string[] | null
          validated_by: string | null
          validation_date: string | null
          visa_cost: number | null
          visa_number: string | null
          visa_obtained_date: string | null
          visa_request_date: string | null
          visa_required: boolean | null
          visa_status: Database["public"]["Enums"]["visa_status"] | null
          visa_type: string | null
          weekend_days: number | null
          working_days: number | null
        }
        Insert: {
          accommodation_cost?: number | null
          accounting_entry_ref?: string | null
          activities_summary?: string | null
          actual_cost?: number | null
          actual_departure_date?: string | null
          actual_return_date?: string | null
          advance_amount?: number | null
          advance_currency?: string | null
          advance_payment_date?: string | null
          advance_payment_mode?:
            | Database["public"]["Enums"]["payment_mode"]
            | null
          advance_status?: Database["public"]["Enums"]["advance_status"] | null
          advance_transaction_ref?: string | null
          agreements_made?: string | null
          airline?: string | null
          amount_to_refund?: number | null
          amount_to_reimburse?: number | null
          b2b_contacts_made?: number | null
          budget_alert_sent?: boolean | null
          budget_available?: boolean | null
          budget_line_id?: string | null
          budget_variance?: number | null
          converted_budget?: number | null
          cost_center?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          departure_time?: string | null
          destination: string
          destination_cities?: string[] | null
          destination_country?: string | null
          difficulties_encountered?: string | null
          direction_id?: string | null
          discussions_summary?: string | null
          documents_brought?: string[] | null
          driver_name?: string | null
          driver_phone?: string | null
          duration_days: number
          emergency_contact_local?: string | null
          employee_id: string
          end_date: string
          estimated_budget?: number | null
          exchange_rate?: number | null
          expected_results?: string | null
          extended_status?:
            | Database["public"]["Enums"]["mission_status_extended"]
            | null
          flight_arrival_time?: string | null
          flight_class?: string | null
          flight_departure_time?: string | null
          flight_number?: string | null
          gps_coordinates?: Json | null
          hotel_address?: string | null
          hotel_check_in?: string | null
          hotel_check_out?: string | null
          hotel_confirmation_ref?: string | null
          hotel_name?: string | null
          hotel_nights?: number | null
          id?: string
          insurance_cost?: number | null
          justification?: string | null
          liquidation_date?: string | null
          liquidation_status?:
            | Database["public"]["Enums"]["liquidation_status"]
            | null
          liquidation_transaction_ref?: string | null
          liquidation_validated_by?: string | null
          local_contact_name?: string | null
          local_contact_phone?: string | null
          mission_incidents?: string | null
          mission_number: string
          mission_type?: Database["public"]["Enums"]["mission_type"] | null
          notes?: string | null
          objectives_achieved?: string | null
          opportunities_identified?: string | null
          other_costs?: number | null
          passport_alert_sent?: boolean | null
          passport_expiry?: string | null
          people_met?: string | null
          per_diem_amount?: number | null
          per_diem_days?: number | null
          photos_uploaded?: string[] | null
          places_to_visit?: string[] | null
          pnr_reference?: string | null
          program_changes?: string | null
          project_id?: string | null
          purpose: string
          recommendations?: string | null
          rental_agency?: string | null
          rental_vehicle_type?: string | null
          report?: string | null
          report_due_date?: string | null
          report_submitted_date?: string | null
          report_validated?: boolean | null
          report_validated_by?: string | null
          report_validated_date?: string | null
          request_date?: string | null
          requester_matricule?: string | null
          requester_position?: string | null
          return_time?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["mission_status"]
          total_actual_expenses?: number | null
          transport_cost?: number | null
          travel_insurance_company?: string | null
          travel_insurance_number?: string | null
          updated_at?: string
          urgency_level?: Database["public"]["Enums"]["mission_urgency"] | null
          vaccination_card_valid?: boolean | null
          vaccinations_required?: string[] | null
          validated_by?: string | null
          validation_date?: string | null
          visa_cost?: number | null
          visa_number?: string | null
          visa_obtained_date?: string | null
          visa_request_date?: string | null
          visa_required?: boolean | null
          visa_status?: Database["public"]["Enums"]["visa_status"] | null
          visa_type?: string | null
          weekend_days?: number | null
          working_days?: number | null
        }
        Update: {
          accommodation_cost?: number | null
          accounting_entry_ref?: string | null
          activities_summary?: string | null
          actual_cost?: number | null
          actual_departure_date?: string | null
          actual_return_date?: string | null
          advance_amount?: number | null
          advance_currency?: string | null
          advance_payment_date?: string | null
          advance_payment_mode?:
            | Database["public"]["Enums"]["payment_mode"]
            | null
          advance_status?: Database["public"]["Enums"]["advance_status"] | null
          advance_transaction_ref?: string | null
          agreements_made?: string | null
          airline?: string | null
          amount_to_refund?: number | null
          amount_to_reimburse?: number | null
          b2b_contacts_made?: number | null
          budget_alert_sent?: boolean | null
          budget_available?: boolean | null
          budget_line_id?: string | null
          budget_variance?: number | null
          converted_budget?: number | null
          cost_center?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          departure_time?: string | null
          destination?: string
          destination_cities?: string[] | null
          destination_country?: string | null
          difficulties_encountered?: string | null
          direction_id?: string | null
          discussions_summary?: string | null
          documents_brought?: string[] | null
          driver_name?: string | null
          driver_phone?: string | null
          duration_days?: number
          emergency_contact_local?: string | null
          employee_id?: string
          end_date?: string
          estimated_budget?: number | null
          exchange_rate?: number | null
          expected_results?: string | null
          extended_status?:
            | Database["public"]["Enums"]["mission_status_extended"]
            | null
          flight_arrival_time?: string | null
          flight_class?: string | null
          flight_departure_time?: string | null
          flight_number?: string | null
          gps_coordinates?: Json | null
          hotel_address?: string | null
          hotel_check_in?: string | null
          hotel_check_out?: string | null
          hotel_confirmation_ref?: string | null
          hotel_name?: string | null
          hotel_nights?: number | null
          id?: string
          insurance_cost?: number | null
          justification?: string | null
          liquidation_date?: string | null
          liquidation_status?:
            | Database["public"]["Enums"]["liquidation_status"]
            | null
          liquidation_transaction_ref?: string | null
          liquidation_validated_by?: string | null
          local_contact_name?: string | null
          local_contact_phone?: string | null
          mission_incidents?: string | null
          mission_number?: string
          mission_type?: Database["public"]["Enums"]["mission_type"] | null
          notes?: string | null
          objectives_achieved?: string | null
          opportunities_identified?: string | null
          other_costs?: number | null
          passport_alert_sent?: boolean | null
          passport_expiry?: string | null
          people_met?: string | null
          per_diem_amount?: number | null
          per_diem_days?: number | null
          photos_uploaded?: string[] | null
          places_to_visit?: string[] | null
          pnr_reference?: string | null
          program_changes?: string | null
          project_id?: string | null
          purpose?: string
          recommendations?: string | null
          rental_agency?: string | null
          rental_vehicle_type?: string | null
          report?: string | null
          report_due_date?: string | null
          report_submitted_date?: string | null
          report_validated?: boolean | null
          report_validated_by?: string | null
          report_validated_date?: string | null
          request_date?: string | null
          requester_matricule?: string | null
          requester_position?: string | null
          return_time?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["mission_status"]
          total_actual_expenses?: number | null
          transport_cost?: number | null
          travel_insurance_company?: string | null
          travel_insurance_number?: string | null
          updated_at?: string
          urgency_level?: Database["public"]["Enums"]["mission_urgency"] | null
          vaccination_card_valid?: boolean | null
          vaccinations_required?: string[] | null
          validated_by?: string | null
          validation_date?: string | null
          visa_cost?: number | null
          visa_number?: string | null
          visa_obtained_date?: string | null
          visa_request_date?: string | null
          visa_required?: boolean | null
          visa_status?: Database["public"]["Enums"]["visa_status"] | null
          visa_type?: string | null
          weekend_days?: number | null
          working_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_orders_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_orders_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_orders_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_program_days: {
        Row: {
          activities: Json | null
          contacts_to_meet: Json | null
          created_at: string | null
          day_date: string
          day_number: number
          events_to_cover: string[] | null
          id: string
          meetings: Json | null
          mission_id: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          activities?: Json | null
          contacts_to_meet?: Json | null
          created_at?: string | null
          day_date: string
          day_number: number
          events_to_cover?: string[] | null
          id?: string
          meetings?: Json | null
          mission_id: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          activities?: Json | null
          contacts_to_meet?: Json | null
          created_at?: string | null
          day_date?: string
          day_number?: number
          events_to_cover?: string[] | null
          id?: string
          meetings?: Json | null
          mission_id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_program_days_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_reports: {
        Row: {
          agreements: Json | null
          b2b_contacts: Json | null
          created_at: string | null
          created_by: string | null
          daily_activities: Json | null
          difficulties: string | null
          documents_collected: string[] | null
          executive_summary: string | null
          follow_up_actions: Json | null
          id: string
          mission_id: string
          objectives_reminder: string | null
          opportunities: Json | null
          people_met: Json | null
          photo_urls: string[] | null
          recommendations: string | null
          report_file_url: string | null
          report_title: string
          results_obtained: string | null
          submitted_at: string | null
          topics_discussed: string | null
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
          validation_comments: string | null
        }
        Insert: {
          agreements?: Json | null
          b2b_contacts?: Json | null
          created_at?: string | null
          created_by?: string | null
          daily_activities?: Json | null
          difficulties?: string | null
          documents_collected?: string[] | null
          executive_summary?: string | null
          follow_up_actions?: Json | null
          id?: string
          mission_id: string
          objectives_reminder?: string | null
          opportunities?: Json | null
          people_met?: Json | null
          photo_urls?: string[] | null
          recommendations?: string | null
          report_file_url?: string | null
          report_title: string
          results_obtained?: string | null
          submitted_at?: string | null
          topics_discussed?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_comments?: string | null
        }
        Update: {
          agreements?: Json | null
          b2b_contacts?: Json | null
          created_at?: string | null
          created_by?: string | null
          daily_activities?: Json | null
          difficulties?: string | null
          documents_collected?: string[] | null
          executive_summary?: string | null
          follow_up_actions?: Json | null
          id?: string
          mission_id?: string
          objectives_reminder?: string | null
          opportunities?: Json | null
          people_met?: Json | null
          photo_urls?: string[] | null
          recommendations?: string | null
          report_file_url?: string | null
          report_title?: string
          results_obtained?: string | null
          submitted_at?: string | null
          topics_discussed?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_comments?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_reports_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      mission_validations: {
        Row: {
          comments: string | null
          created_at: string | null
          id: string
          mission_id: string
          status: Database["public"]["Enums"]["validation_status"] | null
          validated_at: string | null
          validation_level: Database["public"]["Enums"]["validation_level"]
          validator_id: string | null
          validator_name: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          id?: string
          mission_id: string
          status?: Database["public"]["Enums"]["validation_status"] | null
          validated_at?: string | null
          validation_level: Database["public"]["Enums"]["validation_level"]
          validator_id?: string | null
          validator_name?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          id?: string
          mission_id?: string
          status?: Database["public"]["Enums"]["validation_status"] | null
          validated_at?: string | null
          validation_level?: Database["public"]["Enums"]["validation_level"]
          validator_id?: string | null
          validator_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_validations_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_alerts: {
        Row: {
          alert_type: string
          created_at: string
          current_value: number | null
          direction_id: string | null
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          message: string
          reference_id: string | null
          reference_type: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          threshold_value: number | null
          title: string
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          current_value?: number | null
          direction_id?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message: string
          reference_id?: string | null
          reference_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          threshold_value?: number | null
          title: string
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          current_value?: number | null
          direction_id?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message?: string
          reference_id?: string | null
          reference_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          threshold_value?: number | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_alerts_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
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
      opportunity_projects: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          project_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          project_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_projects_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "export_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      partnership_actions: {
        Row: {
          action_description: string
          completion_date: string | null
          created_at: string | null
          due_date: string | null
          id: string
          meeting_id: string | null
          notes: string | null
          partnership_id: string
          responsible: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          action_description: string
          completion_date?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          meeting_id?: string | null
          notes?: string | null
          partnership_id: string
          responsible?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          action_description?: string
          completion_date?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          meeting_id?: string | null
          notes?: string | null
          partnership_id?: string
          responsible?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partnership_actions_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "partnership_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnership_actions_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      partnership_activities: {
        Row: {
          activity_date: string
          activity_type: string
          budget_used: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          event_id: string | null
          id: string
          location: string | null
          notes: string | null
          participants_count: number | null
          partnership_id: string
          status: string | null
          title: string
          training_id: string | null
          updated_at: string | null
        }
        Insert: {
          activity_date: string
          activity_type: string
          budget_used?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          participants_count?: number | null
          partnership_id: string
          status?: string | null
          title: string
          training_id?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_date?: string
          activity_type?: string
          budget_used?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          participants_count?: number | null
          partnership_id?: string
          status?: string | null
          title?: string
          training_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partnership_activities_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnership_activities_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnership_activities_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      partnership_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_date: string
          alert_type: string
          created_at: string | null
          id: string
          is_acknowledged: boolean | null
          message: string
          partnership_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_date: string
          alert_type: string
          created_at?: string | null
          id?: string
          is_acknowledged?: boolean | null
          message: string
          partnership_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_date?: string
          alert_type?: string
          created_at?: string | null
          id?: string
          is_acknowledged?: boolean | null
          message?: string
          partnership_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partnership_alerts_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      partnership_contacts: {
        Row: {
          contact_name: string
          created_at: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          notes: string | null
          partnership_id: string
          phone: string | null
          position: string | null
          updated_at: string | null
        }
        Insert: {
          contact_name: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          partnership_id: string
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_name?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          partnership_id?: string
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partnership_contacts_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      partnership_documents: {
        Row: {
          created_at: string | null
          description: string | null
          document_type: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          parent_document_id: string | null
          partnership_id: string
          updated_at: string | null
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_type: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          parent_document_id?: string | null
          partnership_id: string
          updated_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_type?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          parent_document_id?: string | null
          partnership_id?: string
          updated_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "partnership_documents_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "partnership_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnership_documents_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      partnership_finances: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          partnership_id: string
          receipt_url: string | null
          source: string | null
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          partnership_id: string
          receipt_url?: string | null
          source?: string | null
          transaction_date: string
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          partnership_id?: string
          receipt_url?: string | null
          source?: string | null
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "partnership_finances_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      partnership_meetings: {
        Row: {
          action_items: Json | null
          agenda: string | null
          attendees: string[] | null
          created_at: string | null
          created_by: string | null
          id: string
          location: string | null
          meeting_date: string
          minutes: string | null
          next_meeting_date: string | null
          partnership_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          action_items?: Json | null
          agenda?: string | null
          attendees?: string[] | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          location?: string | null
          meeting_date: string
          minutes?: string | null
          next_meeting_date?: string | null
          partnership_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          action_items?: Json | null
          agenda?: string | null
          attendees?: string[] | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          location?: string | null
          meeting_date?: string
          minutes?: string | null
          next_meeting_date?: string | null
          partnership_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partnership_meetings_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
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
          aciex_focal_email: string | null
          aciex_focal_phone: string | null
          aciex_focal_point: string | null
          aciex_responsibilities: string | null
          budget: number | null
          closure_notes: string | null
          communication_history: Json | null
          confidentiality_clauses: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          deliverables_schedule: string | null
          description: string | null
          direction_id: string
          disbursement_terms: string | null
          domains: string[] | null
          efficiency_score: number | null
          end_date: string | null
          expected_results: string | null
          final_evaluation: string | null
          id: string
          in_kind_contribution: string | null
          kpi_indicators: Json | null
          last_contact_date: string | null
          lifecycle_stage: string | null
          mid_term_evaluation: string | null
          organization_type: string | null
          partner_contribution: number | null
          partner_country: string | null
          partner_logo_url: string | null
          partner_name: string
          partner_responsibilities: string | null
          partner_sector: string | null
          partner_type: string | null
          partner_website: string | null
          priority_level: Database["public"]["Enums"]["priority_level"] | null
          reference_code: string | null
          renewal_conditions: string | null
          renewal_notes: string | null
          resources_provided: string | null
          satisfaction_level: number | null
          signature_date: string | null
          start_date: string | null
          status: string | null
          strategic_objectives: string | null
          target_beneficiaries: string | null
          termination_reason: string | null
          updated_at: string
        }
        Insert: {
          aciex_focal_email?: string | null
          aciex_focal_phone?: string | null
          aciex_focal_point?: string | null
          aciex_responsibilities?: string | null
          budget?: number | null
          closure_notes?: string | null
          communication_history?: Json | null
          confidentiality_clauses?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          deliverables_schedule?: string | null
          description?: string | null
          direction_id: string
          disbursement_terms?: string | null
          domains?: string[] | null
          efficiency_score?: number | null
          end_date?: string | null
          expected_results?: string | null
          final_evaluation?: string | null
          id?: string
          in_kind_contribution?: string | null
          kpi_indicators?: Json | null
          last_contact_date?: string | null
          lifecycle_stage?: string | null
          mid_term_evaluation?: string | null
          organization_type?: string | null
          partner_contribution?: number | null
          partner_country?: string | null
          partner_logo_url?: string | null
          partner_name: string
          partner_responsibilities?: string | null
          partner_sector?: string | null
          partner_type?: string | null
          partner_website?: string | null
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          reference_code?: string | null
          renewal_conditions?: string | null
          renewal_notes?: string | null
          resources_provided?: string | null
          satisfaction_level?: number | null
          signature_date?: string | null
          start_date?: string | null
          status?: string | null
          strategic_objectives?: string | null
          target_beneficiaries?: string | null
          termination_reason?: string | null
          updated_at?: string
        }
        Update: {
          aciex_focal_email?: string | null
          aciex_focal_phone?: string | null
          aciex_focal_point?: string | null
          aciex_responsibilities?: string | null
          budget?: number | null
          closure_notes?: string | null
          communication_history?: Json | null
          confidentiality_clauses?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          deliverables_schedule?: string | null
          description?: string | null
          direction_id?: string
          disbursement_terms?: string | null
          domains?: string[] | null
          efficiency_score?: number | null
          end_date?: string | null
          expected_results?: string | null
          final_evaluation?: string | null
          id?: string
          in_kind_contribution?: string | null
          kpi_indicators?: Json | null
          last_contact_date?: string | null
          lifecycle_stage?: string | null
          mid_term_evaluation?: string | null
          organization_type?: string | null
          partner_contribution?: number | null
          partner_country?: string | null
          partner_logo_url?: string | null
          partner_name?: string
          partner_responsibilities?: string | null
          partner_sector?: string | null
          partner_type?: string | null
          partner_website?: string | null
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          reference_code?: string | null
          renewal_conditions?: string | null
          renewal_notes?: string | null
          resources_provided?: string | null
          satisfaction_level?: number | null
          signature_date?: string | null
          start_date?: string | null
          status?: string | null
          strategic_objectives?: string | null
          target_beneficiaries?: string | null
          termination_reason?: string | null
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
      per_diem_rates: {
        Row: {
          accommodation_rate: number | null
          city: string | null
          country: string
          created_at: string | null
          created_by: string | null
          currency: string | null
          daily_rate: number
          effective_date: string | null
          end_date: string | null
          id: string
          meal_rate: number | null
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          accommodation_rate?: number | null
          city?: string | null
          country: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          daily_rate: number
          effective_date?: string | null
          end_date?: string | null
          id?: string
          meal_rate?: number | null
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          accommodation_rate?: number | null
          city?: string | null
          country?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          daily_rate?: number
          effective_date?: string | null
          end_date?: string | null
          id?: string
          meal_rate?: number | null
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      product_catalogs: {
        Row: {
          catalog_name: string
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          direction_id: string | null
          download_count: number | null
          id: string
          is_published: boolean | null
          publish_date: string | null
          sector: string
          updated_at: string
          version: string | null
        }
        Insert: {
          catalog_name: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id?: string | null
          download_count?: number | null
          id?: string
          is_published?: boolean | null
          publish_date?: string | null
          sector: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          catalog_name?: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id?: string | null
          download_count?: number | null
          id?: string
          is_published?: boolean | null
          publish_date?: string | null
          sector?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_catalogs_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
        ]
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
      project_budget_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          id: string
          project_id: string
          threshold_percentage: number
          triggered_at: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          project_id: string
          threshold_percentage: number
          triggered_at?: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          project_id?: string
          threshold_percentage?: number
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_budget_alerts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "project_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_deliverables: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          milestone_id: string | null
          name: string
          project_id: string
          status: string
          updated_at: string
          validated_at: string | null
          validated_by: string | null
          validation_status: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_id?: string | null
          name: string
          project_id: string
          status?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          validation_status?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_id?: string | null
          name?: string
          project_id?: string
          status?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_deliverables_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_deliverables_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_documents: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          parent_document_id: string | null
          project_id: string
          updated_at: string
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          parent_document_id?: string | null
          project_id: string
          updated_at?: string
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          parent_document_id?: string | null
          project_id?: string
          updated_at?: string
          uploaded_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "project_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          created_by: string | null
          description: string
          expense_date: string
          id: string
          project_id: string
          receipt_url: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          expense_date: string
          id?: string
          project_id: string
          receipt_url?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          expense_date?: string
          id?: string
          project_id?: string
          receipt_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_history: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          project_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          project_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          project_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_kpis: {
        Row: {
          created_at: string
          created_by: string | null
          current_value: number | null
          id: string
          measurement_date: string | null
          name: string
          notes: string | null
          project_id: string
          target_value: number | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          id?: string
          measurement_date?: string | null
          name: string
          notes?: string | null
          project_id: string
          target_value?: number | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          id?: string
          measurement_date?: string | null
          name?: string
          notes?: string | null
          project_id?: string
          target_value?: number | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_kpis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string
          employee_id: string | null
          id: string
          project_id: string
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          id?: string
          project_id: string
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          id?: string
          project_id?: string
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          completed_date: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string
          id: string
          name: string
          progress_percentage: number | null
          project_id: string
          status: string
          updated_at: string
          validation_status: string | null
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date: string
          id?: string
          name: string
          progress_percentage?: number | null
          project_id: string
          status?: string
          updated_at?: string
          validation_status?: string | null
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string
          id?: string
          name?: string
          progress_percentage?: number | null
          project_id?: string
          status?: string
          updated_at?: string
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_risks: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          impact: string
          mitigation_plan: string | null
          name: string
          owner_id: string | null
          probability: string
          project_id: string
          risk_level: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          impact?: string
          mitigation_plan?: string | null
          name: string
          owner_id?: string | null
          probability?: string
          project_id: string
          risk_level?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          impact?: string
          mitigation_plan?: string | null
          name?: string
          owner_id?: string | null
          probability?: string
          project_id?: string
          risk_level?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_risks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_risks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
          actual_end_date: string | null
          actual_start_date: string | null
          budget: number | null
          created_at: string
          created_by: string | null
          description: string | null
          dfe_number: string | null
          direction_id: string
          end_date: string | null
          id: string
          manager_id: string | null
          name: string
          priority_level: Database["public"]["Enums"]["priority_level"] | null
          progress_percentage: number | null
          project_code: string | null
          project_type: string | null
          rccm_number: string | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          actual_end_date?: string | null
          actual_start_date?: string | null
          budget?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dfe_number?: string | null
          direction_id: string
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name: string
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          progress_percentage?: number | null
          project_code?: string | null
          project_type?: string | null
          rccm_number?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          actual_end_date?: string | null
          actual_start_date?: string | null
          budget?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dfe_number?: string | null
          direction_id?: string
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          progress_percentage?: number | null
          project_code?: string | null
          project_type?: string | null
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
          {
            foreignKeyName: "projects_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_lines: {
        Row: {
          created_at: string
          description: string | null
          id: string
          item_name: string
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          item_name: string
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          item_name?: string
          order_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_lines_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          actual_delivery_date: string | null
          budget_id: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          description: string | null
          direction_id: string | null
          expected_delivery_date: string | null
          id: string
          mission_id: string | null
          notes: string | null
          order_date: string
          order_number: string
          procurement_type: Database["public"]["Enums"]["procurement_type"]
          project_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          supplier_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          actual_delivery_date?: string | null
          budget_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          direction_id?: string | null
          expected_delivery_date?: string | null
          id?: string
          mission_id?: string | null
          notes?: string | null
          order_date: string
          order_number: string
          procurement_type: Database["public"]["Enums"]["procurement_type"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          supplier_id?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          actual_delivery_date?: string | null
          budget_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          direction_id?: string | null
          expected_delivery_date?: string | null
          id?: string
          mission_id?: string | null
          notes?: string | null
          order_date?: string
          order_number?: string
          procurement_type?: Database["public"]["Enums"]["procurement_type"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          supplier_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      regulatory_requirements: {
        Row: {
          authority_contact: string | null
          authority_website: string | null
          cost_estimate: number | null
          country: string
          created_at: string
          created_by: string | null
          currency: string | null
          description: string | null
          documents_required: string[] | null
          id: string
          issuing_authority: string | null
          last_updated: string | null
          mandatory: boolean | null
          notes: string | null
          processing_time: string | null
          product_category: string | null
          region: string | null
          requirement_type: string
          sector: string | null
          title: string
          updated_at: string
          useful_links: string[] | null
          validity_period: string | null
        }
        Insert: {
          authority_contact?: string | null
          authority_website?: string | null
          cost_estimate?: number | null
          country: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          documents_required?: string[] | null
          id?: string
          issuing_authority?: string | null
          last_updated?: string | null
          mandatory?: boolean | null
          notes?: string | null
          processing_time?: string | null
          product_category?: string | null
          region?: string | null
          requirement_type: string
          sector?: string | null
          title: string
          updated_at?: string
          useful_links?: string[] | null
          validity_period?: string | null
        }
        Update: {
          authority_contact?: string | null
          authority_website?: string | null
          cost_estimate?: number | null
          country?: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          documents_required?: string[] | null
          id?: string
          issuing_authority?: string | null
          last_updated?: string | null
          mandatory?: boolean | null
          notes?: string | null
          processing_time?: string | null
          product_category?: string | null
          region?: string | null
          requirement_type?: string
          sector?: string | null
          title?: string
          updated_at?: string
          useful_links?: string[] | null
          validity_period?: string | null
        }
        Relationships: []
      }
      satisfaction_surveys: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          direction_id: string | null
          end_date: string | null
          id: string
          questions: Json | null
          reference_id: string | null
          reference_type: string | null
          start_date: string | null
          status: string | null
          survey_type: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id?: string | null
          end_date?: string | null
          id?: string
          questions?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          start_date?: string | null
          status?: string | null
          survey_type: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id?: string | null
          end_date?: string | null
          id?: string
          questions?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          start_date?: string | null
          status?: string | null
          survey_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "satisfaction_surveys_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_objectives: {
        Row: {
          created_at: string
          created_by: string | null
          current_value: number | null
          description: string | null
          direction_id: string | null
          end_date: string | null
          fiscal_year: number
          id: string
          notes: string | null
          objective_type: string
          parent_objective_id: string | null
          priority: string | null
          start_date: string | null
          status: string | null
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          description?: string | null
          direction_id?: string | null
          end_date?: string | null
          fiscal_year?: number
          id?: string
          notes?: string | null
          objective_type: string
          parent_objective_id?: string | null
          priority?: string | null
          start_date?: string | null
          status?: string | null
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          description?: string | null
          direction_id?: string | null
          end_date?: string | null
          fiscal_year?: number
          id?: string
          notes?: string | null
          objective_type?: string
          parent_objective_id?: string | null
          priority?: string | null
          start_date?: string | null
          status?: string | null
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategic_objectives_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_objectives_parent_objective_id_fkey"
            columns: ["parent_objective_id"]
            isOneToOne: false
            referencedRelation: "strategic_objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          bank_account: string | null
          category: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          category?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          category?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["ticket_category"]
          created_at: string
          description: string
          direction_id: string | null
          equipment_id: string | null
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          requester_id: string
          resolution: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_number: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category: Database["public"]["Enums"]["ticket_category"]
          created_at?: string
          description: string
          direction_id?: string | null
          equipment_id?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          requester_id: string
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_number: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["ticket_category"]
          created_at?: string
          description?: string
          direction_id?: string | null
          equipment_id?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          requester_id?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_number?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          comments: string | null
          id: string
          overall_rating: number | null
          respondent_email: string | null
          respondent_id: string | null
          respondent_type: string | null
          responses: Json
          submitted_at: string
          survey_id: string
        }
        Insert: {
          comments?: string | null
          id?: string
          overall_rating?: number | null
          respondent_email?: string | null
          respondent_id?: string | null
          respondent_type?: string | null
          responses?: Json
          submitted_at?: string
          survey_id: string
        }
        Update: {
          comments?: string | null
          id?: string
          overall_rating?: number | null
          respondent_email?: string | null
          respondent_id?: string | null
          respondent_type?: string | null
          responses?: Json
          submitted_at?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "satisfaction_surveys"
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
      trade_mission_participants: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          is_paid: boolean | null
          mission_id: string
          notes: string | null
          participant_email: string | null
          participant_name: string
          participant_phone: string | null
          participation_fee: number | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_paid?: boolean | null
          mission_id: string
          notes?: string | null
          participant_email?: string | null
          participant_name: string
          participant_phone?: string | null
          participation_fee?: number | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_paid?: boolean | null
          mission_id?: string
          notes?: string | null
          participant_email?: string | null
          participant_name?: string
          participant_phone?: string | null
          participation_fee?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_mission_participants_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_mission_participants_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "trade_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_missions: {
        Row: {
          budget_actual: number | null
          budget_estimated: number | null
          created_at: string
          created_by: string | null
          currency: string | null
          destination_city: string | null
          destination_country: string
          direction_id: string | null
          end_date: string
          event_id: string | null
          id: string
          lessons_learned: string | null
          mission_name: string
          mission_type: string
          objectives: string | null
          organizer: string | null
          report_summary: string | null
          results_contacts: number | null
          results_contracts: number | null
          results_leads: number | null
          results_value: number | null
          start_date: string
          status: string | null
          target_sectors: string[] | null
          updated_at: string
        }
        Insert: {
          budget_actual?: number | null
          budget_estimated?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          destination_city?: string | null
          destination_country: string
          direction_id?: string | null
          end_date: string
          event_id?: string | null
          id?: string
          lessons_learned?: string | null
          mission_name: string
          mission_type: string
          objectives?: string | null
          organizer?: string | null
          report_summary?: string | null
          results_contacts?: number | null
          results_contracts?: number | null
          results_leads?: number | null
          results_value?: number | null
          start_date: string
          status?: string | null
          target_sectors?: string[] | null
          updated_at?: string
        }
        Update: {
          budget_actual?: number | null
          budget_estimated?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          destination_city?: string | null
          destination_country?: string
          direction_id?: string | null
          end_date?: string
          event_id?: string | null
          id?: string
          lessons_learned?: string | null
          mission_name?: string
          mission_type?: string
          objectives?: string | null
          organizer?: string | null
          report_summary?: string | null
          results_contacts?: number | null
          results_contracts?: number | null
          results_leads?: number | null
          results_value?: number | null
          start_date?: string
          status?: string | null
          target_sectors?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_missions_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_missions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
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
      training_projects: {
        Row: {
          created_at: string
          id: string
          project_id: string
          training_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          training_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          training_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_projects_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
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
      training_trainers: {
        Row: {
          created_at: string | null
          id: string
          trainer_id: string
          training_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          trainer_id: string
          training_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          trainer_id?: string
          training_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_trainers_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_trainers_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          created_at: string
          created_by: string | null
          current_participants: number | null
          description: string | null
          direction_id: string
          end_date: string
          external_id: string | null
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
          external_id?: string | null
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
          external_id?: string | null
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
          peut_creer: boolean
          peut_exporter: boolean
          peut_modifier: boolean
          peut_supprimer: boolean
          peut_valider: boolean
          peut_voir: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          direction_id: string
          id?: string
          module: Database["public"]["Enums"]["app_module"]
          peut_creer?: boolean
          peut_exporter?: boolean
          peut_modifier?: boolean
          peut_supprimer?: boolean
          peut_valider?: boolean
          peut_voir?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          direction_id?: string
          id?: string
          module?: Database["public"]["Enums"]["app_module"]
          peut_creer?: boolean
          peut_exporter?: boolean
          peut_modifier?: boolean
          peut_supprimer?: boolean
          peut_valider?: boolean
          peut_voir?: boolean
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
      shared_modules: {
        Row: {
          id: string
          module: Database["public"]["Enums"]["app_module"]
          source_direction_id: string
          target_direction_id: string
          peut_voir: boolean
          peut_creer: boolean
          peut_modifier: boolean
          peut_exporter: boolean
          shared_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module: Database["public"]["Enums"]["app_module"]
          source_direction_id: string
          target_direction_id: string
          peut_voir?: boolean
          peut_creer?: boolean
          peut_modifier?: boolean
          peut_exporter?: boolean
          shared_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module?: Database["public"]["Enums"]["app_module"]
          source_direction_id?: string
          target_direction_id?: string
          peut_voir?: boolean
          peut_creer?: boolean
          peut_modifier?: boolean
          peut_exporter?: boolean
          shared_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_modules_source_direction_id_fkey"
            columns: ["source_direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_modules_target_direction_id_fkey"
            columns: ["target_direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
        ]
      }
      access_log: {
        Row: {
          id: string
          user_id: string
          module: Database["public"]["Enums"]["app_module"]
          action: string
          details: Json
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module: Database["public"]["Enums"]["app_module"]
          action: string
          details?: Json
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module?: Database["public"]["Enums"]["app_module"]
          action?: string
          details?: Json
          ip_address?: string | null
          created_at?: string
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
      user_menu_permissions: {
        Row: {
          user_id: string
          module: Database["public"]["Enums"]["app_module"]
          peut_voir: boolean
          peut_creer: boolean
          peut_modifier: boolean
          peut_supprimer: boolean
          peut_exporter: boolean
          peut_valider: boolean
          direction_name: string
          access_type: string
        }
        Relationships: []
      }
    }
    Functions: {
      check_module_action: {
        Args: {
          _user_id: string
          _module: Database["public"]["Enums"]["app_module"]
          _action: string
        }
        Returns: boolean
      }
      log_access: {
        Args: {
          _module: Database["public"]["Enums"]["app_module"]
          _action: string
          _details?: Json
        }
        Returns: undefined
      }
      check_overdue_mission_reports: { Args: never; Returns: undefined }
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
      has_document_access: { Args: { doc_id: string }; Returns: boolean }
      has_folder_access: { Args: { folder_id: string }; Returns: boolean }
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
      increment_media_download_count: {
        Args: { media_id: string }
        Returns: undefined
      }
      increment_media_view_count: {
        Args: { media_id: string }
        Returns: undefined
      }
      is_account_approved: { Args: { _user_id: string }; Returns: boolean }
      is_email_allowed: { Args: { check_email: string }; Returns: boolean }
      user_has_direction_access: {
        Args: { _direction_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      accounting_entry_type: "Débit" | "Crédit"
      advance_status: "En attente" | "Approuvée" | "Versée" | "Liquidée"
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
        | "achats"
        | "support"
        | "rh"
        | "missions"
        | "comptabilite"
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
      contract_type: "CDI" | "CDD" | "Stage" | "Consultant" | "Temporaire"
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
      leave_status: "En attente" | "Approuvé" | "Refusé" | "Annulé"
      leave_type:
        | "Congé annuel"
        | "Congé maladie"
        | "Congé maternité"
        | "Congé paternité"
        | "Permission"
        | "Autre"
      liquidation_status:
        | "En attente"
        | "En cours"
        | "Validée"
        | "Rejetée"
        | "Soldée"
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
      mission_status:
        | "Brouillon"
        | "En attente validation"
        | "Validée"
        | "En cours"
        | "Terminée"
        | "Annulée"
      mission_status_extended:
        | "Brouillon"
        | "Soumise"
        | "En validation N1"
        | "En validation DAF"
        | "En validation DG"
        | "Approuvée"
        | "Rejetée"
        | "Annulée"
        | "Planifiée"
        | "En cours"
        | "Terminée"
        | "En attente rapport"
        | "Rapport soumis"
        | "En liquidation"
        | "Liquidée"
        | "Soldée"
      mission_type: "Nationale" | "Internationale"
      mission_urgency: "Normale" | "Urgente" | "Très urgente"
      niveau_categorisation: "Niveau 1" | "Niveau 2" | "Niveau 3"
      opportunity_status:
        | "URGENT"
        | "NOUVEAU"
        | "RECOMMANDÉ"
        | "EN_COURS"
        | "FERMÉ"
      order_status:
        | "Brouillon"
        | "Validée"
        | "En cours"
        | "Reçue"
        | "Clôturée"
        | "Annulée"
      participation_type: "Foires" | "Salons" | "Jamais"
      payment_mode: "Virement" | "Chèque" | "Espèces"
      phase_communication:
        | "Avant événement"
        | "Pendant événement"
        | "Après événement"
      priority_level: "1" | "3" | "5"
      procurement_type: "Gré à gré" | "Appel d'offres" | "Consultation"
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
      ticket_category:
        | "Informatique"
        | "Réseau"
        | "Matériel"
        | "Logiciel"
        | "Téléphonie"
        | "Automobile"
        | "Infrastructure"
        | "Autre"
      ticket_priority: "Basse" | "Moyenne" | "Haute" | "Urgente"
      ticket_status: "Ouvert" | "En cours" | "En attente" | "Résolu" | "Fermé"
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
      validation_level: "N1_Superieur" | "N2_DAF" | "N3_DG"
      validation_status: "En attente" | "Approuvé" | "Rejeté"
      visa_status: "Non requis" | "En cours" | "Obtenu" | "Refusé" | "Expiré"
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
      accounting_entry_type: ["Débit", "Crédit"],
      advance_status: ["En attente", "Approuvée", "Versée", "Liquidée"],
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
        "achats",
        "support",
        "rh",
        "missions",
        "comptabilite",
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
      contract_type: ["CDI", "CDD", "Stage", "Consultant", "Temporaire"],
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
      leave_status: ["En attente", "Approuvé", "Refusé", "Annulé"],
      leave_type: [
        "Congé annuel",
        "Congé maladie",
        "Congé maternité",
        "Congé paternité",
        "Permission",
        "Autre",
      ],
      liquidation_status: [
        "En attente",
        "En cours",
        "Validée",
        "Rejetée",
        "Soldée",
      ],
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
      mission_status: [
        "Brouillon",
        "En attente validation",
        "Validée",
        "En cours",
        "Terminée",
        "Annulée",
      ],
      mission_status_extended: [
        "Brouillon",
        "Soumise",
        "En validation N1",
        "En validation DAF",
        "En validation DG",
        "Approuvée",
        "Rejetée",
        "Annulée",
        "Planifiée",
        "En cours",
        "Terminée",
        "En attente rapport",
        "Rapport soumis",
        "En liquidation",
        "Liquidée",
        "Soldée",
      ],
      mission_type: ["Nationale", "Internationale"],
      mission_urgency: ["Normale", "Urgente", "Très urgente"],
      niveau_categorisation: ["Niveau 1", "Niveau 2", "Niveau 3"],
      opportunity_status: [
        "URGENT",
        "NOUVEAU",
        "RECOMMANDÉ",
        "EN_COURS",
        "FERMÉ",
      ],
      order_status: [
        "Brouillon",
        "Validée",
        "En cours",
        "Reçue",
        "Clôturée",
        "Annulée",
      ],
      participation_type: ["Foires", "Salons", "Jamais"],
      payment_mode: ["Virement", "Chèque", "Espèces"],
      phase_communication: [
        "Avant événement",
        "Pendant événement",
        "Après événement",
      ],
      priority_level: ["1", "3", "5"],
      procurement_type: ["Gré à gré", "Appel d'offres", "Consultation"],
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
      ticket_category: [
        "Informatique",
        "Réseau",
        "Matériel",
        "Logiciel",
        "Téléphonie",
        "Automobile",
        "Infrastructure",
        "Autre",
      ],
      ticket_priority: ["Basse", "Moyenne", "Haute", "Urgente"],
      ticket_status: ["Ouvert", "En cours", "En attente", "Résolu", "Fermé"],
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
      validation_level: ["N1_Superieur", "N2_DAF", "N3_DG"],
      validation_status: ["En attente", "Approuvé", "Rejeté"],
      visa_status: ["Non requis", "En cours", "Obtenu", "Refusé", "Expiré"],
    },
  },
} as const
