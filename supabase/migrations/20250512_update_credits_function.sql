
-- Function to update user credits
CREATE OR REPLACE FUNCTION public.update_user_credits(user_id UUID, amount INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET credits = credits + amount
  WHERE id = user_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.update_user_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_credits TO service_role;
