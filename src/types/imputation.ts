export type ImputationEtat = 'En attente' | 'En cours' | 'Terminé';

export interface Imputation {
  id: string;
  date_reception: string;
  provenance: string;
  objet: string;
  imputation: string;
  date_imputation?: string | null;
  date_realisation?: string | null;
  observations?: string | null;
  etat: ImputationEtat;
  direction_id?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export type ImputationFormData = Omit<Imputation, 'id' | 'created_at' | 'updated_at'>;
