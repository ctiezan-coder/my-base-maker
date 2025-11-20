-- Améliorer le trigger handle_new_user pour mieux gérer direction_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_direction_id uuid;
BEGIN
  -- Extraire et convertir direction_id depuis les métadonnées
  BEGIN
    v_direction_id := (NEW.raw_user_meta_data->>'direction_id')::uuid;
  EXCEPTION WHEN OTHERS THEN
    -- Si la conversion échoue, lever une erreur pour empêcher la création
    RAISE EXCEPTION 'Direction ID invalide ou manquant dans les métadonnées utilisateur';
  END;
  
  -- Vérifier que direction_id n'est pas NULL
  IF v_direction_id IS NULL THEN
    RAISE EXCEPTION 'Direction ID est requis pour créer un utilisateur';
  END IF;
  
  -- Insérer le profil avec toutes les données requises
  INSERT INTO public.profiles (user_id, full_name, email, direction_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    NEW.email,
    v_direction_id
  );
  
  RETURN NEW;
END;
$$;