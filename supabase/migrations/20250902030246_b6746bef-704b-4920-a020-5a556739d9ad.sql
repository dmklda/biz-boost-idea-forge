-- Create regulatory_analyses table for persisting regulatory analysis results
CREATE TABLE public.regulatory_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_sector TEXT NOT NULL,
  business_description TEXT NOT NULL,
  target_audience TEXT,
  business_model TEXT,
  location TEXT NOT NULL DEFAULT 'Brazil',
  analysis_results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.regulatory_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own regulatory analyses" 
ON public.regulatory_analyses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own regulatory analyses" 
ON public.regulatory_analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own regulatory analyses" 
ON public.regulatory_analyses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own regulatory analyses" 
ON public.regulatory_analyses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_regulatory_analyses_updated_at
BEFORE UPDATE ON public.regulatory_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();