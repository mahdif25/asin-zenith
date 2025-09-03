-- Create proxy_configurations table
CREATE TABLE public.proxy_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider_id TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  last_test_result JSONB,
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider_id)
);

-- Create data_usage_settings table
CREATE TABLE public.data_usage_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add data_used column to api_requests table
ALTER TABLE public.api_requests 
ADD COLUMN data_used BIGINT DEFAULT 0;

-- Enable RLS
ALTER TABLE public.proxy_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_usage_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for proxy_configurations
CREATE POLICY "Users can view their own proxy configurations"
ON public.proxy_configurations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own proxy configurations"
ON public.proxy_configurations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own proxy configurations"
ON public.proxy_configurations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own proxy configurations"
ON public.proxy_configurations
FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for data_usage_settings
CREATE POLICY "Users can view their own data usage settings"
ON public.data_usage_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own data usage settings"
ON public.data_usage_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data usage settings"
ON public.data_usage_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_proxy_configurations_updated_at
BEFORE UPDATE ON public.proxy_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_usage_settings_updated_at
BEFORE UPDATE ON public.data_usage_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();