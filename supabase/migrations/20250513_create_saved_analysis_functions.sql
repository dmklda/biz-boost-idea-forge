
-- Function to get a saved analysis by original analysis ID and user ID
CREATE OR REPLACE FUNCTION public.get_saved_analysis(
  p_original_analysis_id UUID,
  p_user_id UUID
)
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
  WHERE original_analysis_id = p_original_analysis_id
  AND user_id = p_user_id;
END;
$$;

-- Function to update a saved analysis
CREATE OR REPLACE FUNCTION public.update_saved_analysis(
  p_id UUID,
  p_updated_at TIMESTAMPTZ
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.saved_analyses
  SET updated_at = p_updated_at
  WHERE id = p_id;
END;
$$;

-- Function to create a saved analysis
CREATE OR REPLACE FUNCTION public.create_saved_analysis(
  p_user_id UUID,
  p_idea_id UUID,
  p_idea_title TEXT,
  p_original_analysis_id UUID,
  p_analysis_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.saved_analyses (
    user_id,
    idea_id,
    idea_title,
    original_analysis_id,
    analysis_data
  )
  VALUES (
    p_user_id,
    p_idea_id,
    p_idea_title,
    p_original_analysis_id,
    p_analysis_data
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_saved_analysis TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_saved_analysis TO service_role;

GRANT EXECUTE ON FUNCTION public.update_saved_analysis TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_saved_analysis TO service_role;

GRANT EXECUTE ON FUNCTION public.create_saved_analysis TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_saved_analysis TO service_role;
