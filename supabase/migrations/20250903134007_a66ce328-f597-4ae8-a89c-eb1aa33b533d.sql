-- Create custom types for the application
CREATE TYPE public.marketplace_type AS ENUM (
  'US', 'UK', 'DE', 'FR', 'IT', 'ES', 'CA', 'JP', 'AU', 'IN', 'MX', 'BR'
);

CREATE TYPE public.tracking_frequency AS ENUM (
  'hourly', 'every_6_hours', 'daily', 'weekly'
);

CREATE TYPE public.tracking_status AS ENUM (
  'active', 'paused', 'completed', 'failed'
);

-- User profiles table (extends auth.users)
CREATE TABLE public.user_profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  daily_api_limit INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tracking jobs table (core tracking configurations)
CREATE TABLE public.tracking_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asin TEXT NOT NULL,
  marketplace marketplace_type NOT NULL DEFAULT 'US',
  keywords TEXT[] NOT NULL,
  tracking_frequency tracking_frequency NOT NULL DEFAULT 'daily',
  status tracking_status NOT NULL DEFAULT 'active',
  random_delay_min INTEGER DEFAULT 20,
  random_delay_max INTEGER DEFAULT 30,
  last_tracked_at TIMESTAMP WITH TIME ZONE,
  next_tracking_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Position history table (time-series data)
CREATE TABLE public.position_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_job_id UUID NOT NULL REFERENCES public.tracking_jobs(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  organic_position INTEGER,
  sponsored_position INTEGER,
  search_volume INTEGER,
  competition_level TEXT,
  tracked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- API requests tracking (for rate limiting and anti-detection)
CREATE TABLE public.api_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tracking_job_id UUID REFERENCES public.tracking_jobs(id) ON DELETE SET NULL,
  marketplace marketplace_type NOT NULL,
  keyword TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  response_time_ms INTEGER,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tracking schedules (for automated execution)
CREATE TABLE public.tracking_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tracking_job_id UUID NOT NULL REFERENCES public.tracking_jobs(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE,
  status tracking_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- RLS Policies for tracking_jobs
CREATE POLICY "Users can view their own tracking jobs" 
ON public.tracking_jobs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tracking jobs" 
ON public.tracking_jobs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracking jobs" 
ON public.tracking_jobs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracking jobs" 
ON public.tracking_jobs 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for position_history
CREATE POLICY "Users can view their own position history" 
ON public.position_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tracking_jobs 
    WHERE tracking_jobs.id = position_history.tracking_job_id 
    AND tracking_jobs.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert position history" 
ON public.position_history 
FOR INSERT 
WITH CHECK (true); -- Will be restricted by service role in Edge Functions

-- RLS Policies for api_requests
CREATE POLICY "Users can view their own API requests" 
ON public.api_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert API requests" 
ON public.api_requests 
FOR INSERT 
WITH CHECK (true); -- Will be restricted by service role in Edge Functions

-- RLS Policies for tracking_schedules
CREATE POLICY "Users can view their own schedules" 
ON public.tracking_schedules 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedules" 
ON public.tracking_schedules 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update schedules" 
ON public.tracking_schedules 
FOR UPDATE 
USING (true); -- Will be restricted by service role in Edge Functions

-- Create indexes for better performance
CREATE INDEX idx_tracking_jobs_user_id ON public.tracking_jobs(user_id);
CREATE INDEX idx_tracking_jobs_status ON public.tracking_jobs(status);
CREATE INDEX idx_tracking_jobs_next_tracking ON public.tracking_jobs(next_tracking_at);

CREATE INDEX idx_position_history_tracking_job ON public.position_history(tracking_job_id);
CREATE INDEX idx_position_history_keyword ON public.position_history(keyword);
CREATE INDEX idx_position_history_tracked_at ON public.position_history(tracked_at DESC);

CREATE INDEX idx_api_requests_user_id ON public.api_requests(user_id);
CREATE INDEX idx_api_requests_created_at ON public.api_requests(created_at DESC);

CREATE INDEX idx_tracking_schedules_scheduled_at ON public.tracking_schedules(scheduled_at);
CREATE INDEX idx_tracking_schedules_status ON public.tracking_schedules(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tracking_jobs_updated_at
  BEFORE UPDATE ON public.tracking_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();