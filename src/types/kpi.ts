export interface KpiTracking {
  id: string;
  kpi_name: string;
  kpi_value: number;
  period: string;
  target_value?: number | null;
  unit?: string | null;
  notes?: string | null;
  direction_id: string;
  created_by?: string | null;
  created_at: string;
}

export type KpiFormData = Omit<KpiTracking, 'id' | 'created_at'>;
