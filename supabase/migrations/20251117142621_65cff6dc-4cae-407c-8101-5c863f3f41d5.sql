-- Create table for user alert preferences
CREATE TABLE public.market_alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  notification_type TEXT NOT NULL DEFAULT 'both', -- 'email', 'in_app', 'both'
  
  -- Matching criteria
  sectors TEXT[],
  regions TEXT[],
  min_value NUMERIC,
  max_value NUMERIC,
  countries TEXT[],
  keywords TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for sent alerts
CREATE TABLE public.market_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preference_id UUID NOT NULL REFERENCES public.market_alert_preferences(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.export_opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT now(),
  notification_sent BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  
  UNIQUE(preference_id, opportunity_id)
);

-- Enable RLS
ALTER TABLE public.market_alert_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for market_alert_preferences
CREATE POLICY "Users can view own alert preferences"
  ON public.market_alert_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own alert preferences"
  ON public.market_alert_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alert preferences"
  ON public.market_alert_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alert preferences"
  ON public.market_alert_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for market_alerts
CREATE POLICY "Users can view own alerts"
  ON public.market_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create alerts"
  ON public.market_alerts
  FOR INSERT
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_market_alert_preferences_updated_at
  BEFORE UPDATE ON public.market_alert_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_market_alert_preferences_user_id ON public.market_alert_preferences(user_id);
CREATE INDEX idx_market_alert_preferences_active ON public.market_alert_preferences(is_active);
CREATE INDEX idx_market_alerts_user_id ON public.market_alerts(user_id);
CREATE INDEX idx_market_alerts_opportunity_id ON public.market_alerts(opportunity_id);