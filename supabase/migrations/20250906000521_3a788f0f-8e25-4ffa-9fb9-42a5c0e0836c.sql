-- Update users with 'pro' plan to 'entrepreneur' plan
UPDATE public.profiles 
SET plan = 'entrepreneur' 
WHERE plan = 'pro';