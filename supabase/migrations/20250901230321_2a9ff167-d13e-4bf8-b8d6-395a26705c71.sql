-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for scenario simulations
CREATE TABLE public.scenario_simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  idea_id UUID,
  simulation_name TEXT NOT NULL,
  simulation_params JSONB NOT NULL,
  results JSONB NOT NULL,
  revenue_model TEXT NOT NULL,
  financial_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scenario_simulations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own simulations" 
ON public.scenario_simulations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own simulations" 
ON public.scenario_simulations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own simulations" 
ON public.scenario_simulations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own simulations" 
ON public.scenario_simulations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_scenario_simulations_updated_at
BEFORE UPDATE ON public.scenario_simulations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();