-- Add account status to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'pending';

-- Add constraint to ensure valid status values
ALTER TABLE profiles ADD CONSTRAINT valid_account_status 
  CHECK (account_status IN ('pending', 'approved', 'rejected', 'suspended'));

-- Add index for faster queries on account status
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);

-- Update existing users to approved status
UPDATE profiles SET account_status = 'approved' WHERE account_status = 'pending';

-- Create function to check if user account is approved
CREATE OR REPLACE FUNCTION public.is_account_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT account_status = 'approved'
  FROM profiles
  WHERE user_id = _user_id;
$$;

-- Create notification for admins when new user signs up
CREATE OR REPLACE FUNCTION public.notify_admins_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create notifications for all admin users
  INSERT INTO notifications (user_id, title, message, type, reference_table, reference_id)
  SELECT 
    ur.user_id,
    'Nouvelle demande d''inscription',
    'Un nouvel utilisateur ' || NEW.full_name || ' (' || NEW.email || ') demande l''accès à la plateforme',
    'info',
    'profiles',
    NEW.id
  FROM user_roles ur
  WHERE ur.role = 'admin';
  
  RETURN NEW;
END;
$$;

-- Create trigger to notify admins on new user signup
DROP TRIGGER IF EXISTS on_new_user_signup ON profiles;
CREATE TRIGGER on_new_user_signup
  AFTER INSERT ON profiles
  FOR EACH ROW
  WHEN (NEW.account_status = 'pending')
  EXECUTE FUNCTION notify_admins_new_user();