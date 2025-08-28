-- Add idea_id column to validation_requests table to link with existing ideas
ALTER TABLE public.validation_requests 
ADD COLUMN idea_id UUID REFERENCES public.ideas(id) ON DELETE SET NULL;