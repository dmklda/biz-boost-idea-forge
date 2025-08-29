-- Update early_adopters policies to use the new roles system

-- Drop the old admin policies that use is_admin function
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.early_adopters;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.early_adopters;

-- Create new admin policies using the has_role function
CREATE POLICY "Admins can view all early adopter profiles" 
ON public.early_adopters 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any early adopter profile" 
ON public.early_adopters 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'::app_role));