-- Mettre à jour la fonction handle_new_user pour prendre en compte direction_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, direction_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    NEW.email,
    (NEW.raw_user_meta_data->>'direction_id')::uuid
  );
  RETURN NEW;
END;
$$;