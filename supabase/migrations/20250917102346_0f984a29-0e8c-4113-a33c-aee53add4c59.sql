-- Create export history table
CREATE TABLE public.export_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  format text NOT NULL,
  data_types text[] NOT NULL,
  date_range jsonb NOT NULL,
  filename text NOT NULL,
  file_size bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own export history" 
ON public.export_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert export history" 
ON public.export_history 
FOR INSERT 
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_export_history_user_created ON public.export_history(user_id, created_at DESC);