-- Mettre à jour tous les comptes en attente pour les approuver automatiquement
UPDATE public.profiles 
SET account_status = 'approved' 
WHERE account_status = 'pending';

-- Modifier la fonction de création de profil pour approuver automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, direction_id, account_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    (NEW.raw_user_meta_data->>'direction_id')::uuid,
    'approved'  -- Auto-approuver tous les nouveaux comptes
  );
  RETURN NEW;
END;
$$;