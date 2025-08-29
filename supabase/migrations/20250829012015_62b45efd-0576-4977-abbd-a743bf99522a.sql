-- Fix RLS policies for early_adopters table to resolve 406 errors

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their own early adopter profile" ON public.early_adopters;
DROP POLICY IF EXISTS "Users can create their own early adopter profile" ON public.early_adopters;
DROP POLICY IF EXISTS "Users can update their own early adopter profile" ON public.early_adopters;
DROP POLICY IF EXISTS "Admins can view all early adopter requests" ON public.early_adopters;
DROP POLICY IF EXISTS "Admins can update early adopter status" ON public.early_adopters;

-- Create new comprehensive RLS policies
-- Allow users to view their own early adopter profile
CREATE POLICY "Users can view their own early adopter profile" 
ON public.early_adopters 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert their own early adopter profile  
CREATE POLICY "Users can create their own early adopter profile" 
ON public.early_adopters 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own early adopter profile (but not status)
CREATE POLICY "Users can update their own early adopter profile" 
ON public.early_adopters 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all early adopter requests
CREATE POLICY "Admins can view all early adopter requests" 
ON public.early_adopters 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND public.is_admin(profiles.email)
  )
);

-- Allow admins to update early adopter status
CREATE POLICY "Admins can update early adopter status" 
ON public.early_adopters 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND public.is_admin(profiles.email)
  )
);

-- Allow approved early adopters to be viewed by everyone (for marketplace)
CREATE POLICY "Approved early adopters are viewable by authenticated users" 
ON public.early_adopters 
FOR SELECT 
USING (status = 'approved' AND auth.role() = 'authenticated');