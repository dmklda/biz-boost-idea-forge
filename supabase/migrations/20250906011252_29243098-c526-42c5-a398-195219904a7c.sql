-- Update handle_new_user function to assign correct initial credits based on plan
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, plan, credits)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    'free',
    3  -- Free plan gets 3 initial credits
  );
  RETURN new;
END;
$$;

-- Create function to set initial credits when plan changes
CREATE OR REPLACE FUNCTION public.set_initial_plan_credits(
  user_id_param UUID,
  new_plan TEXT
) RETURNS VOID AS $$
BEGIN
  -- Set initial credits based on plan
  IF new_plan = 'entrepreneur' THEN
    UPDATE public.profiles 
    SET credits = credits + 50,
        plan = new_plan
    WHERE id = user_id_param;
    
    -- Log the transaction
    INSERT INTO public.credit_transactions (user_id, amount, description, feature)
    VALUES (user_id_param, 50, 'Initial credits for Entrepreneur plan', 'plan_upgrade');
    
  ELSIF new_plan = 'business' THEN
    UPDATE public.profiles 
    SET credits = credits + 200,
        plan = new_plan
    WHERE id = user_id_param;
    
    -- Log the transaction
    INSERT INTO public.credit_transactions (user_id, amount, description, feature)
    VALUES (user_id_param, 200, 'Initial credits for Business plan', 'plan_upgrade');
    
  ELSE
    -- For free plan, just update the plan (no additional credits)
    UPDATE public.profiles 
    SET plan = new_plan
    WHERE id = user_id_param;
  END IF;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';