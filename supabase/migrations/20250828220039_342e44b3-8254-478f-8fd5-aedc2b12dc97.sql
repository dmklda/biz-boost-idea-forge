-- Create validation requests table
CREATE TABLE public.validation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
  entrepreneur_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  validation_type TEXT NOT NULL CHECK (validation_type IN ('feedback', 'survey', 'interview', 'prototype_test')),
  reward_points INTEGER NOT NULL DEFAULT 50,
  max_responses INTEGER NOT NULL DEFAULT 100,
  requirements TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create early adopters table  
CREATE TABLE public.early_adopters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  bio TEXT,
  interests TEXT[],
  rating DECIMAL(3,2) NOT NULL DEFAULT 5.0,
  completed_validations INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  expertise_areas TEXT[],
  availability TEXT NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
  hourly_rate DECIMAL(10,2),
  portfolio_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create validation responses table
CREATE TABLE public.validation_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  validation_request_id UUID REFERENCES public.validation_requests(id) ON DELETE CASCADE,
  adopter_id UUID NOT NULL,
  response_data JSONB NOT NULL,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  time_spent_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Create validation participants table
CREATE TABLE public.validation_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  validation_request_id UUID REFERENCES public.validation_requests(id) ON DELETE CASCADE,
  adopter_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn'))
);

-- Create marketplace rewards table
CREATE TABLE public.marketplace_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  validation_response_id UUID REFERENCES public.validation_responses(id) ON DELETE SET NULL,
  points_awarded INTEGER NOT NULL,
  reward_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketplace analytics table
CREATE TABLE public.marketplace_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  validation_request_id UUID REFERENCES public.validation_requests(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL NOT NULL,
  metric_data JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.validation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.early_adopters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for validation_requests
CREATE POLICY "Users can view all active validation requests" 
ON public.validation_requests 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Users can create their own validation requests" 
ON public.validation_requests 
FOR INSERT 
WITH CHECK (auth.uid() = entrepreneur_id);

CREATE POLICY "Users can update their own validation requests" 
ON public.validation_requests 
FOR UPDATE 
USING (auth.uid() = entrepreneur_id);

CREATE POLICY "Users can delete their own validation requests" 
ON public.validation_requests 
FOR DELETE 
USING (auth.uid() = entrepreneur_id);

-- RLS Policies for early_adopters
CREATE POLICY "Users can view all early adopters" 
ON public.early_adopters 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own early adopter profile" 
ON public.early_adopters 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own early adopter profile" 
ON public.early_adopters 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for validation_responses
CREATE POLICY "Users can view responses to their requests" 
ON public.validation_responses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM validation_requests vr 
    WHERE vr.id = validation_response_id AND vr.entrepreneur_id = auth.uid()
  ) OR adopter_id = auth.uid()
);

CREATE POLICY "Users can create their own responses" 
ON public.validation_responses 
FOR INSERT 
WITH CHECK (auth.uid() = adopter_id);

CREATE POLICY "Users can update their own responses" 
ON public.validation_responses 
FOR UPDATE 
USING (auth.uid() = adopter_id);

-- RLS Policies for validation_participants
CREATE POLICY "Users can view participants of their requests" 
ON public.validation_participants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM validation_requests vr 
    WHERE vr.id = validation_request_id AND vr.entrepreneur_id = auth.uid()
  ) OR adopter_id = auth.uid()
);

CREATE POLICY "Users can join validations" 
ON public.validation_participants 
FOR INSERT 
WITH CHECK (auth.uid() = adopter_id);

CREATE POLICY "Users can update their own participation" 
ON public.validation_participants 
FOR UPDATE 
USING (auth.uid() = adopter_id);

-- RLS Policies for marketplace_rewards
CREATE POLICY "Users can view their own rewards" 
ON public.marketplace_rewards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert rewards" 
ON public.marketplace_rewards 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for marketplace_analytics
CREATE POLICY "Users can view analytics for their requests" 
ON public.marketplace_analytics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM validation_requests vr 
    WHERE vr.id = validation_request_id AND vr.entrepreneur_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_validation_requests_entrepreneur ON validation_requests(entrepreneur_id);
CREATE INDEX idx_validation_requests_idea ON validation_requests(idea_id);
CREATE INDEX idx_validation_requests_status ON validation_requests(status);
CREATE INDEX idx_early_adopters_user ON early_adopters(user_id);
CREATE INDEX idx_validation_responses_request ON validation_responses(validation_request_id);
CREATE INDEX idx_validation_responses_adopter ON validation_responses(adopter_id);
CREATE INDEX idx_validation_participants_request ON validation_participants(validation_request_id);
CREATE INDEX idx_validation_participants_adopter ON validation_participants(adopter_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_validation_requests_updated_at
    BEFORE UPDATE ON validation_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_early_adopters_updated_at
    BEFORE UPDATE ON early_adopters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();