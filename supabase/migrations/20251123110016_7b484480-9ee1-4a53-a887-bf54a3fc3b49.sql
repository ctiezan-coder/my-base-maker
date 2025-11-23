-- Update handle_new_user function to set account_status to pending for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_direction_id uuid;
BEGIN
  -- Extract direction_id from metadata
  BEGIN
    v_direction_id := (NEW.raw_user_meta_data->>'direction_id')::uuid;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Direction ID invalide ou manquant dans les métadonnées utilisateur';
  END;
  
  -- Check that direction_id is not NULL
  IF v_direction_id IS NULL THEN
    RAISE EXCEPTION 'Direction ID est requis pour créer un utilisateur';
  END IF;
  
  -- Insert profile with pending status for new signups
  INSERT INTO public.profiles (user_id, full_name, email, direction_id, account_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    NEW.email,
    v_direction_id,
    'pending'
  );
  
  RETURN NEW;
END;
$$;