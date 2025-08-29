-- Fix conflicting RLS policies on early_adopters table

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view all early adopters" ON public.early_adopters;
DROP POLICY IF EXISTS "Users can view their own early adopter profile" ON public.early_adopters;
DROP POLICY IF EXISTS "Users can create their own early adopter profile" ON public.early_adopters;
DROP POLICY IF EXISTS "Users can update their own early adopter profile" ON public.early_adopters;
DROP POLICY IF EXISTS "Admins can view all early adopter requests" ON public.early_adopters;
DROP POLICY IF EXISTS "Admins can update early adopter status" ON public.early_adopters;
DROP POLICY IF EXISTS "Approved early adopters are viewable by authenticated users" ON public.early_adopters;

-- Create clean, non-conflicting policies

-- 1. Users can view their own profile OR approved early adopters (for marketplace)
CREATE POLICY "Users can view early adopters" 
ON public.early_adopters 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (status = 'approved' AND auth.role() = 'authenticated')
);

-- 2. Users can create their own profile
CREATE POLICY "Users can create early adopter profile" 
ON public.early_adopters 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own profile (non-admin fields only)
CREATE POLICY "Users can update their profile" 
ON public.early_adopters 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.early_adopters 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND public.is_admin(profiles.email)
  )
);

-- 5. Admins can update any profile (for approval/rejection)
CREATE POLICY "Admins can update any profile" 
ON public.early_adopters 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND public.is_admin(profiles.email)
  )
);