// Types étendus pour le Module Opérateurs enrichi

export type LegalStatus = 'Actif' | 'En cessation' | 'Liquidation' | 'Suspendu';

export type ExportMaturityLevel = 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';

export type AccompanimentType = 'Individuel' | 'Collectif' | 'Ponctuel';

export type StrategicSegment = 'Champion' | 'En développement' | 'À potentiel' | 'À surveiller';

export type NeedsPriority = 'Urgent' | 'Important' | 'Moyen' | 'Faible';

export type RiskLevel = 'Faible' | 'Moyen' | 'Élevé' | 'Critique';

export type TurnoverCategory = 
  | 'Moins de 100M FCFA'
  | '100M - 500M FCFA'
  | '500M - 1Md FCFA'
  | 'Plus de 1Md FCFA';

export type GrowthPotential = 'Faible' | 'Moyen' | 'Fort' | 'Très fort';

export interface CompanySite {
  id: string;
  company_id: string;
  site_type: string;
  site_name: string;
  address?: string;
  city?: string;
  region?: string;
  gps_latitude?: number;
  gps_longitude?: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyContact {
  id: string;
  company_id: string;
  department: string;
  name: string;
  function?: string;
  email?: string;
  phone?: string;
  is_primary: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyLeadershipHistory {
  id: string;
  company_id: string;
  leader_name: string;
  position: string;
  start_date?: string;
  end_date?: string;
  reason_for_change?: string;
  notes?: string;
  created_at: string;
}

export interface CompanyProduct {
  id: string;
  company_id: string;
  product_name: string;
  product_code?: string;
  hs_code?: string;
  category?: string;
  product_range?: string;
  description?: string;
  unit?: string;
  price_fob?: number;
  price_cif?: number;
  currency: string;
  min_order_quantity?: number;
  production_capacity?: number;
  available_quantity?: number;
  is_exported: boolean;
  is_featured: boolean;
  photo_url?: string;
  is_new_development: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyCertification {
  id: string;
  company_id: string;
  certification_type: string;
  certification_name: string;
  issuing_body?: string;
  issue_date?: string;
  expiry_date?: string;
  status: string;
  certificate_number?: string;
  certificate_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyExportMarket {
  id: string;
  company_id: string;
  country: string;
  market_type: 'current' | 'target';
  market_share_percent?: number;
  annual_volume?: number;
  annual_value?: number;
  currency: string;
  main_clients?: string[];
  barriers_encountered?: string;
  entry_date?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyAccompanimentHistory {
  id: string;
  company_id: string;
  interaction_type: string;
  interaction_date: string;
  subject: string;
  description?: string;
  outcome?: string;
  next_steps?: string;
  documents_shared?: string[];
  officer_id?: string;
  officer_name?: string;
  duration_minutes?: number;
  location?: string;
  created_by?: string;
  created_at: string;
}

export interface CompanyAccompanimentPlan {
  id: string;
  company_id: string;
  plan_title: string;
  fiscal_year?: number;
  status: string;
  start_date?: string;
  end_date?: string;
  initial_diagnostic?: string;
  smart_objectives?: any;
  aciex_services?: string[];
  milestones?: any;
  success_indicators?: any;
  allocated_budget?: number;
  consumed_budget?: number;
  responsible_officer_id?: string;
  responsible_officer_name?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyAccompanimentAction {
  id: string;
  plan_id?: string;
  company_id: string;
  action_title: string;
  action_type?: string;
  description?: string;
  status: string;
  priority: string;
  planned_date?: string;
  completed_date?: string;
  responsible_id?: string;
  responsible_name?: string;
  estimated_cost?: number;
  actual_cost?: number;
  outcome?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyProgramParticipation {
  id: string;
  company_id: string;
  program_type: string;
  program_name: string;
  program_id?: string;
  participation_date?: string;
  status: string;
  role?: string;
  benefits_obtained?: string;
  contacts_made?: number;
  contracts_signed?: number;
  contract_value?: number;
  feedback?: string;
  rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanySuccessStory {
  id: string;
  company_id: string;
  story_title: string;
  story_type: string;
  content: string;
  key_results?: any;
  contracts_concluded?: number;
  contract_total_value?: number;
  new_markets_entered?: string[];
  export_increase_percent?: number;
  jobs_created?: number;
  testimonial_text?: string;
  testimonial_author?: string;
  testimonial_date?: string;
  media_urls?: string[];
  video_url?: string;
  is_published: boolean;
  publication_authorized: boolean;
  authorized_by?: string;
  authorization_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyDocument {
  id: string;
  company_id: string;
  document_type: string;
  document_name: string;
  file_url?: string;
  file_size?: number;
  issue_date?: string;
  expiry_date?: string;
  status: string;
  notes?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyExportKPI {
  id: string;
  company_id: string;
  fiscal_year: number;
  period?: string;
  export_turnover?: number;
  export_volume?: number;
  number_of_markets?: number;
  new_markets?: number;
  number_of_contracts?: number;
  contracts_value?: number;
  number_of_clients?: number;
  new_clients?: number;
  client_retention_rate?: number;
  average_payment_delay_days?: number;
  complaint_rate?: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyEvaluation {
  id: string;
  company_id: string;
  evaluation_date: string;
  evaluator_id?: string;
  evaluator_name?: string;
  evaluation_type: string;
  export_performance_score?: number;
  quality_rating?: number;
  production_capacity_rating?: number;
  management_rating?: number;
  financial_health_rating?: number;
  engagement_rating?: number;
  overall_score?: number;
  strengths?: string;
  weaknesses?: string;
  opportunities?: string;
  threats?: string;
  recommendations?: string;
  next_evaluation_date?: string;
  notes?: string;
  created_at: string;
}

export interface CompanyRisk {
  id: string;
  company_id: string;
  risk_type: string;
  risk_description: string;
  probability: string;
  impact: string;
  risk_level: string;
  mitigation_actions?: string;
  status: string;
  identified_date?: string;
  resolved_date?: string;
  responsible_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyCommunication {
  id: string;
  company_id: string;
  communication_type: string;
  channel: string;
  subject: string;
  content?: string;
  sent_date?: string;
  status: string;
  opened_at?: string;
  clicked_at?: string;
  response_received: boolean;
  response_date?: string;
  sent_by?: string;
  notes?: string;
  created_at: string;
}

// Extended Company interface with all new fields
export interface ExtendedCompany {
  id: string;
  company_name: string;
  trade_name?: string;
  sigle?: string;
  rccm_number: string;
  dfe_number: string;
  legal_form?: string;
  legal_status?: LegalStatus;
  company_size?: string;
  creation_date?: string;
  registration_date_aciex?: string;
  headquarters_location: string;
  postal_address?: string;
  city?: string;
  region?: string;
  commune?: string;
  postal_code?: string;
  gps_latitude?: number;
  gps_longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  facebook_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  legal_representative_name?: string;
  legal_representative_gender?: string;
  legal_representative_phone?: string;
  legal_representative_email?: string;
  main_contact_name?: string;
  main_contact_function?: string;
  main_contact_email?: string;
  main_contact_phone?: string;
  export_manager_name?: string;
  export_manager_email?: string;
  export_manager_phone?: string;
  has_export_service?: boolean;
  activity_sector?: string;
  sub_sector?: string;
  filiere?: string;
  products_services?: string;
  exported_products?: string;
  hs_codes?: string[];
  product_ranges?: string[];
  annual_capacity?: number;
  current_production?: number;
  capacity_utilization_rate?: number;
  production_equipment?: string;
  can_increase_capacity?: boolean;
  production_lead_time_days?: number;
  available_stock?: string;
  total_employees?: number;
  permanent_employees?: number;
  seasonal_employees?: number;
  male_employees?: number;
  female_employees?: number;
  managers_count?: number;
  technicians_count?: number;
  workers_count?: number;
  annual_turnover?: number;
  export_turnover?: number;
  export_rate?: number;
  market_share?: number;
  turnover_evolution_3y?: any;
  target_export_markets?: string[];
  current_export_markets?: string[];
  distribution_channels?: string[];
  practiced_incoterms?: string[];
  export_barriers?: string;
  certifications?: string[];
  commercial_events_participation?: string;
  support_needed?: string;
  first_contact_date?: string;
  accompaniment_start_date?: string;
  accompaniment_status?: string;
  assigned_aciex_officer?: string;
  assigned_aciex_officer_id?: string;
  accompaniment_type?: AccompanimentType;
  export_maturity_level?: ExportMaturityLevel;
  financial_needs?: string;
  technical_needs?: string;
  marketing_needs?: string;
  logistics_needs?: string;
  needs_priority?: NeedsPriority;
  specific_needs_details?: string;
  initial_diagnostic?: string;
  smart_objectives?: any;
  accompaniment_budget?: number;
  company_category?: string;
  turnover_category?: TurnoverCategory;
  growth_potential?: GrowthPotential;
  accompaniment_priority?: string;
  strategic_segment?: StrategicSegment;
  export_performance_score?: number;
  quality_rating?: number;
  capacity_rating?: number;
  management_rating?: number;
  engagement_rating?: number;
  identified_risks?: string;
  global_risk_level?: RiskLevel;
  photo_url?: string;
  catalog_url?: string;
  aciex_interaction_history?: string;
  direction_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Tab identifiers for the details dialog
export type CompanyDetailsTab = 
  | 'overview'
  | 'identity'
  | 'contacts'
  | 'activity'
  | 'production'
  | 'hr'
  | 'performance'
  | 'markets'
  | 'certifications'
  | 'accompaniment'
  | 'history'
  | 'programs'
  | 'success'
  | 'documents'
  | 'kpis'
  | 'evaluation'
  | 'risks';

// Constants for select options
export const LEGAL_STATUS_OPTIONS: LegalStatus[] = ['Actif', 'En cessation', 'Liquidation', 'Suspendu'];

export const EXPORT_MATURITY_OPTIONS: ExportMaturityLevel[] = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'];

export const ACCOMPANIMENT_TYPE_OPTIONS: AccompanimentType[] = ['Individuel', 'Collectif', 'Ponctuel'];

export const STRATEGIC_SEGMENT_OPTIONS: StrategicSegment[] = ['Champion', 'En développement', 'À potentiel', 'À surveiller'];

export const NEEDS_PRIORITY_OPTIONS: NeedsPriority[] = ['Urgent', 'Important', 'Moyen', 'Faible'];

export const RISK_LEVEL_OPTIONS: RiskLevel[] = ['Faible', 'Moyen', 'Élevé', 'Critique'];

export const TURNOVER_CATEGORY_OPTIONS: TurnoverCategory[] = [
  'Moins de 100M FCFA',
  '100M - 500M FCFA',
  '500M - 1Md FCFA',
  'Plus de 1Md FCFA'
];

export const GROWTH_POTENTIAL_OPTIONS: GrowthPotential[] = ['Faible', 'Moyen', 'Fort', 'Très fort'];

export const CERTIFICATION_TYPES = [
  'ISO 9001',
  'ISO 22000',
  'ISO 14001',
  'HACCP',
  'GlobalGAP',
  'BRC',
  'IFS',
  'Fairtrade',
  'Bio/Organic',
  'UTZ',
  'Rainforest Alliance',
  'Label Origine Côte d\'Ivoire',
  'Autre'
];

export const INCOTERMS = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'];

export const DEPARTMENT_OPTIONS = ['Commercial', 'Production', 'Qualité', 'Logistique', 'Finance', 'Direction', 'Export', 'RH', 'Autre'];

export const DOCUMENT_TYPES = [
  'Statuts',
  'RCCM',
  'Attestation fiscale',
  'Attestation CNPS',
  'RIB',
  'Certificat d\'origine',
  'Licence d\'exportation',
  'Certificat phytosanitaire',
  'Certificat qualité',
  'Contrat commercial',
  'Autre'
];

export const INTERACTION_TYPES = [
  'Réunion',
  'Appel téléphonique',
  'Email',
  'Visite terrain',
  'Formation',
  'Conseil',
  'Mise en relation B2B',
  'Participation événement',
  'Autre'
];

export const PROGRAM_TYPES = [
  'Mission commerciale',
  'Salon/Foire',
  'Formation',
  'Accompagnement sectoriel',
  'Programme de certification',
  'Autre'
];

export const REGIONS_CI = [
  'District d\'Abidjan',
  'Bas-Sassandra',
  'Comoé',
  'Denguélé',
  'Gôh-Djiboua',
  'Lacs',
  'Lagunes',
  'Montagnes',
  'Sassandra-Marahoué',
  'Savanes',
  'Vallée du Bandama',
  'Woroba',
  'Yamoussoukro',
  'Zanzan'
];
