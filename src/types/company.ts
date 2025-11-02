export type LegalForm = 
  | 'SARL'
  | 'SA'
  | 'SARLU'
  | 'SNC'
  | 'SCS'
  | 'SCA'
  | 'GIE'
  | 'Entreprise individuelle'
  | 'Autre';

export type CompanySize = 
  | 'TPE (1-9)'
  | 'PME (10-49)'
  | 'ETI (50-249)'
  | 'Grande entreprise (250+)';

export type Gender = 'M' | 'F' | 'Autre';

export type ParticipationType = 
  | 'Jamais'
  | 'Occasionnellement'
  | 'Régulièrement'
  | 'Fréquemment';

export type SupportNeeded = 
  | 'Information'
  | 'Formation'
  | 'Financement'
  | 'Accompagnement technique'
  | 'Mise en relation';

export interface Company {
  id: string;
  company_name: string;
  trade_name?: string | null;
  rccm_number: string;
  dfe_number: string;
  legal_form?: LegalForm | null;
  company_size?: CompanySize | null;
  creation_date?: string | null;
  headquarters_location: string;
  postal_address?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  legal_representative_name?: string | null;
  legal_representative_gender?: Gender | null;
  legal_representative_phone?: string | null;
  legal_representative_email?: string | null;
  export_manager_name?: string | null;
  export_manager_email?: string | null;
  export_manager_phone?: string | null;
  has_export_service?: boolean;
  activity_sector?: string | null;
  products_services?: string | null;
  exported_products?: string | null;
  target_export_markets?: string[] | null;
  current_export_markets?: string[] | null;
  certifications?: string[] | null;
  annual_turnover?: number | null;
  commercial_events_participation?: ParticipationType;
  support_needed?: SupportNeeded | null;
  accompaniment_status?: string | null;
  aciex_interaction_history?: string | null;
  direction_id?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export type CompanyFormData = Omit<Company, 'id' | 'created_at' | 'updated_at'>;
