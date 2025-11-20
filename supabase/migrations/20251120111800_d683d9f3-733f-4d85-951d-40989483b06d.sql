
-- Activer la réplication en temps réel pour la table notifications si ce n'est pas déjà fait
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- Table already in publication, continue
  END;
END $$;

-- Créer une fonction trigger pour créer des notifications lors de l'envoi de messages
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  receiver_id uuid;
  sender_profile record;
BEGIN
  -- Récupérer les informations du sender
  SELECT full_name, email INTO sender_profile
  FROM profiles
  WHERE user_id = NEW.sender_id;
  
  -- Créer une notification pour chaque destinataire
  FOREACH receiver_id IN ARRAY NEW.receiver_ids
  LOOP
    INSERT INTO notifications (user_id, title, message, type, reference_table, reference_id)
    VALUES (
      receiver_id,
      'Nouveau message',
      'Vous avez reçu un nouveau message de ' || COALESCE(sender_profile.full_name, sender_profile.email, 'un collaborateur'),
      'info',
      'chat_messages',
      NEW.id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger pour les nouveaux messages
DROP TRIGGER IF EXISTS trigger_notify_new_message ON public.chat_messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();
