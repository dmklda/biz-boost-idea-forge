
-- Function to get all saved analyses for a user
CREATE OR REPLACE FUNCTION public.get_all_saved_analyses()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  idea_id UUID,
  idea_title TEXT,
  original_analysis_id UUID,
  analysis_data JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.saved_analyses
  WHERE user_id = auth.uid();
END;
$$;

-- Function to delete a saved analysis
CREATE OR REPLACE FUNCTION public.delete_saved_analysis(
  p_id UUID,
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.saved_analyses
  WHERE id = p_id
  AND user_id = p_user_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_all_saved_analyses TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_saved_analyses TO service_role;

GRANT EXECUTE ON FUNCTION public.delete_saved_analysis TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_saved_analysis TO service_role;
