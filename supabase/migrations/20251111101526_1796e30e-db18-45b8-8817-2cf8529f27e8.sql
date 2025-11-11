-- Création de la table imputations pour gérer les documents et leur traitement
CREATE TABLE public.imputations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date_reception date NOT NULL,
  provenance text NOT NULL,
  objet text NOT NULL,
  imputation text NOT NULL, -- Direction responsable
  date_imputation date,
  date_realisation date,
  observations text,
  etat text NOT NULL DEFAULT 'En attente' CHECK (etat IN ('En attente', 'En cours', 'Terminé')),
  direction_id uuid REFERENCES public.directions(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX idx_imputations_direction_id ON public.imputations(direction_id);
CREATE INDEX idx_imputations_etat ON public.imputations(etat);
CREATE INDEX idx_imputations_date_reception ON public.imputations(date_reception);
CREATE INDEX idx_imputations_created_by ON public.imputations(created_by);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_imputations_updated_at
  BEFORE UPDATE ON public.imputations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Activer RLS
ALTER TABLE public.imputations ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
-- Les managers et admins peuvent tout gérer
CREATE POLICY "Managers can manage imputations"
  ON public.imputations
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Les utilisateurs peuvent voir les imputations de leur direction
CREATE POLICY "Users can view imputations from their direction"
  ON public.imputations
  FOR SELECT
  USING (
    direction_id IN (
      SELECT d.id
      FROM directions d
      JOIN profiles p ON p.direction = d.name
      WHERE p.user_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Activer realtime pour les mises à jour en temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE public.imputations;