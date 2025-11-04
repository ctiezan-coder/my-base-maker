export type MarketRegion = 
  | 'Europe'
  | 'Afrique'
  | 'ZLECAf'
  | 'Asie'
  | 'Moyen-Orient'
  | 'Amérique du Nord'
  | 'Amérique du Sud';

export type RiskLevel = 'Faible' | 'Modéré' | 'Élevé';

export type OpportunityStatus = 
  | 'URGENT'
  | 'NOUVEAU'
  | 'RECOMMANDÉ'
  | 'EN_COURS'
  | 'FERMÉ';

export type ConnectionStatus = 
  | 'En négociation'
  | 'Contrat signé'
  | 'En cours'
  | 'Terminé';

export interface PotentialMarket {
  id: string;
  region: MarketRegion;
  country: string;
  sector: string;
  market_potential: string;
  demand_description?: string | null;
  key_products?: string[] | null;
  requirements?: string[] | null;
  risk_level?: RiskLevel;
  market_size_billion?: number | null;
  growth_rate?: number | null;
  direction_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExportOpportunity {
  id: string;
  title: string;
  sector: string;
  destination_country: string;
  destination_city?: string | null;
  region: MarketRegion;
  estimated_value: number;
  currency?: string;
  compatibility_score?: number | null;
  deadline: string;
  volume: string;
  description: string;
  requirements?: string[] | null;
  status?: OpportunityStatus;
  direction_id?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessConnection {
  id: string;
  connection_date: string;
  company_id?: string | null;
  pme_name: string;
  partner_name: string;
  sector: string;
  destination_country: string;
  contract_value: number;
  currency?: string;
  status: ConnectionStatus;
  contract_duration_years?: number | null;
  jobs_created?: number | null;
  social_impact?: string | null;
  direction_id?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketStatistics {
  id: string;
  year: number;
  export_value_billions: number;
  intra_african_trade_percent?: number | null;
  pme_count?: number | null;
  active_markets?: number | null;
  business_connections_count?: number | null;
  conversion_rate?: number | null;
  total_value_generated?: number | null;
  average_deal_days?: number | null;
  direction_id?: string | null;
  created_at: string;
  updated_at: string;
}

export type PotentialMarketFormData = Omit<PotentialMarket, 'id' | 'created_at' | 'updated_at'>;
export type ExportOpportunityFormData = Omit<ExportOpportunity, 'id' | 'created_at' | 'updated_at'>;
export type BusinessConnectionFormData = Omit<BusinessConnection, 'id' | 'created_at' | 'updated_at'>;
export type MarketStatisticsFormData = Omit<MarketStatistics, 'id' | 'created_at' | 'updated_at'>;
