// Types pour le module Mission complet

export type MissionType = 'Nationale' | 'Internationale';

export type MissionUrgency = 'Normale' | 'Urgente' | 'Très urgente';

export type MissionExtendedStatus = 
  | 'Brouillon'
  | 'Soumise'
  | 'En validation N1'
  | 'En validation DAF'
  | 'En validation DG'
  | 'Approuvée'
  | 'Rejetée'
  | 'Annulée'
  | 'Planifiée'
  | 'En cours'
  | 'Terminée'
  | 'En attente rapport'
  | 'Rapport soumis'
  | 'En liquidation'
  | 'Liquidée'
  | 'Soldée';

export type ValidationStatus = 'En attente' | 'Approuvé' | 'Rejeté';

export type ValidationLevel = 'N1_Superieur' | 'N2_DAF' | 'N3_DG';

export type AdvanceStatus = 'En attente' | 'Approuvée' | 'Versée' | 'Liquidée';

export type PaymentMode = 'Virement' | 'Chèque' | 'Espèces';

export type VisaStatus = 'Non requis' | 'En cours' | 'Obtenu' | 'Refusé' | 'Expiré';

export type LiquidationStatus = 'En attente' | 'En cours' | 'Validée' | 'Rejetée' | 'Soldée';

export interface MissionOrder {
  id: string;
  mission_number: string;
  employee_id: string;
  direction_id?: string;
  project_id?: string;
  purpose: string;
  destination: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  estimated_budget?: number;
  actual_cost?: number;
  advance_amount?: number;
  status: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Nouveaux champs
  mission_type?: MissionType;
  urgency_level?: MissionUrgency;
  extended_status?: MissionExtendedStatus;
  justification?: string;
  expected_results?: string;
  request_date?: string;
  requester_matricule?: string;
  requester_position?: string;
  
  // Dates et heures
  departure_time?: string;
  return_time?: string;
  working_days?: number;
  weekend_days?: number;
  
  // Destination
  destination_country?: string;
  destination_cities?: string[];
  gps_coordinates?: any;
  places_to_visit?: string[];
  
  // Budget
  currency?: string;
  transport_cost?: number;
  accommodation_cost?: number;
  per_diem_amount?: number;
  per_diem_days?: number;
  visa_cost?: number;
  insurance_cost?: number;
  other_costs?: number;
  exchange_rate?: number;
  converted_budget?: number;
  
  // Avance
  advance_status?: AdvanceStatus;
  advance_currency?: string;
  advance_payment_mode?: PaymentMode;
  advance_payment_date?: string;
  advance_transaction_ref?: string;
  
  // Budget
  budget_line_id?: string;
  cost_center?: string;
  budget_available?: boolean;
  budget_alert_sent?: boolean;
  
  // Logistique
  airline?: string;
  flight_number?: string;
  flight_class?: string;
  pnr_reference?: string;
  flight_departure_time?: string;
  flight_arrival_time?: string;
  hotel_name?: string;
  hotel_address?: string;
  hotel_check_in?: string;
  hotel_check_out?: string;
  hotel_nights?: number;
  hotel_confirmation_ref?: string;
  rental_vehicle_type?: string;
  rental_agency?: string;
  driver_name?: string;
  driver_phone?: string;
  
  // Visa
  visa_required?: boolean;
  visa_type?: string;
  visa_status?: VisaStatus;
  visa_request_date?: string;
  visa_obtained_date?: string;
  visa_number?: string;
  passport_expiry?: string;
  passport_alert_sent?: boolean;
  vaccinations_required?: string[];
  vaccination_card_valid?: boolean;
  travel_insurance_number?: string;
  travel_insurance_company?: string;
  
  // Suivi
  actual_departure_date?: string;
  actual_return_date?: string;
  local_contact_name?: string;
  local_contact_phone?: string;
  emergency_contact_local?: string;
  mission_incidents?: string;
  program_changes?: string;
  
  // Rapport
  report_due_date?: string;
  report_submitted_date?: string;
  report_validated?: boolean;
  report_validated_by?: string;
  report_validated_date?: string;
  objectives_achieved?: string;
  activities_summary?: string;
  people_met?: string;
  discussions_summary?: string;
  opportunities_identified?: string;
  b2b_contacts_made?: number;
  agreements_made?: string;
  difficulties_encountered?: string;
  recommendations?: string;
  documents_brought?: string[];
  photos_uploaded?: string[];
  
  // Liquidation
  liquidation_status?: LiquidationStatus;
  total_actual_expenses?: number;
  budget_variance?: number;
  amount_to_refund?: number;
  amount_to_reimburse?: number;
  liquidation_date?: string;
  liquidation_validated_by?: string;
  liquidation_transaction_ref?: string;
  accounting_entry_ref?: string;
  
  // Relations
  employee?: {
    first_name: string;
    last_name: string;
    employee_number?: string;
    position?: string;
  };
  direction?: {
    name: string;
  };
  project?: {
    name: string;
  };
}

export interface MissionItinerary {
  id: string;
  mission_id: string;
  step_order: number;
  departure_location: string;
  arrival_location: string;
  departure_date?: string;
  arrival_date?: string;
  transport_mode?: string;
  transport_details?: string;
  accommodation?: string;
  notes?: string;
  created_at: string;
}

export interface MissionProgramDay {
  id: string;
  mission_id: string;
  day_date: string;
  day_number: number;
  activities: any[];
  meetings: any[];
  contacts_to_meet: any[];
  events_to_cover?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MissionValidation {
  id: string;
  mission_id: string;
  validation_level: ValidationLevel;
  validator_id?: string;
  validator_name?: string;
  status: ValidationStatus;
  comments?: string;
  validated_at?: string;
  created_at: string;
}

export interface MissionExpense {
  id: string;
  mission_id: string;
  expense_category: string;
  description: string;
  amount: number;
  currency: string;
  expense_date?: string;
  receipt_number?: string;
  receipt_url?: string;
  is_justified: boolean;
  justification_status: string;
  comptable_comments?: string;
  created_at: string;
  updated_at: string;
}

export interface PerDiemRate {
  id: string;
  country: string;
  city?: string;
  daily_rate: number;
  currency: string;
  accommodation_rate?: number;
  meal_rate?: number;
  effective_date: string;
  end_date?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MissionAlert {
  id: string;
  mission_id: string;
  alert_type: string;
  alert_message: string;
  is_read: boolean;
  is_resolved: boolean;
  target_user_id?: string;
  created_at: string;
  resolved_at?: string;
}

export interface MissionReport {
  id: string;
  mission_id: string;
  report_title: string;
  executive_summary?: string;
  objectives_reminder?: string;
  results_obtained?: string;
  daily_activities: any[];
  people_met: any[];
  topics_discussed?: string;
  opportunities: any[];
  b2b_contacts: any[];
  agreements: any[];
  difficulties?: string;
  recommendations?: string;
  follow_up_actions: any[];
  documents_collected?: string[];
  photo_urls?: string[];
  report_file_url?: string;
  submitted_at?: string;
  validated_by?: string;
  validated_at?: string;
  validation_comments?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MissionLiquidation {
  id: string;
  mission_id: string;
  advance_received: number;
  total_expenses: number;
  variance: number;
  amount_to_refund: number;
  amount_to_reimburse: number;
  status: LiquidationStatus;
  comptable_id?: string;
  comptable_validation_date?: string;
  comptable_comments?: string;
  accounting_entry_number?: string;
  analytical_code?: string;
  payment_date?: string;
  payment_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface MissionStats {
  total: number;
  brouillon: number;
  enValidation: number;
  approuvees: number;
  enCours: number;
  terminees: number;
  enAttenteRapport: number;
  enLiquidation: number;
  nationales: number;
  internationales: number;
  budgetTotal: number;
  budgetConsomme: number;
}
