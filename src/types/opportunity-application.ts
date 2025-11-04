export interface OpportunityApplication {
  id: string;
  opportunity_id: string;
  company_id: string;
  application_date: string;
  status: string;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyMarketInterest {
  id: string;
  company_id: string;
  market_id: string;
  interest_level: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type OpportunityApplicationFormData = Omit<OpportunityApplication, 'id' | 'created_at' | 'updated_at'>;
export type CompanyMarketInterestFormData = Omit<CompanyMarketInterest, 'id' | 'created_at' | 'updated_at'>;
