-- Add approval system fields to early_adopters table
ALTER TABLE public.early_adopters 
ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN approved_by uuid,
ADD COLUMN approved_at timestamp with time zone,
ADD COLUMN rejection_reason text;

-- Update existing early adopters to approved status (if any)
UPDATE public.early_adopters SET status = 'approved' WHERE status IS NULL;

-- Create admin role check function
CREATE OR REPLACE FUNCTION public.is_admin(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT user_email = 'marcior631@gmail.com';
$$;

-- Create function to approve early adopter
CREATE OR REPLACE FUNCTION public.approve_early_adopter(
  adopter_id uuid,
  admin_user_id uuid,
  admin_email text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(admin_email) THEN
    RAISE EXCEPTION 'Access denied. Only admins can approve early adopters.';
  END IF;
  
  -- Update the early adopter status
  UPDATE public.early_adopters 
  SET 
    status = 'approved',
    approved_by = admin_user_id,
    approved_at = NOW()
  WHERE id = adopter_id;
END;
$$;

-- Create function to reject early adopter
CREATE OR REPLACE FUNCTION public.reject_early_adopter(
  adopter_id uuid,
  admin_user_id uuid,
  admin_email text,
  reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(admin_email) THEN
    RAISE EXCEPTION 'Access denied. Only admins can reject early adopters.';
  END IF;
  
  -- Update the early adopter status
  UPDATE public.early_adopters 
  SET 
    status = 'rejected',
    approved_by = admin_user_id,
    approved_at = NOW(),
    rejection_reason = reason
  WHERE id = adopter_id;
END;
$$;

-- Add RLS policies for admin access
CREATE POLICY "Admins can view all early adopter requests" 
ON public.early_adopters 
FOR SELECT 
USING (
  (SELECT public.is_admin(email) FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can update early adopter status" 
ON public.early_adopters 
FOR UPDATE 
USING (
  (SELECT public.is_admin(email) FROM public.profiles WHERE id = auth.uid())
);