-- Create Stripe webhook function for handling payments
CREATE OR REPLACE FUNCTION handle_stripe_payment(
  session_id TEXT,
  customer_id TEXT,
  amount_total INTEGER,
  metadata JSONB,
  payment_status TEXT
) RETURNS VOID AS $$
DECLARE
  user_uuid UUID;
  credit_amount INTEGER;
  plan_type TEXT;
BEGIN
  -- Extract user_id from metadata
  user_uuid := (metadata->>'user_id')::UUID;
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'User ID not found in metadata';
  END IF;
  
  -- Handle credit purchases
  IF metadata->>'payment_type' = 'credits' THEN
    credit_amount := (metadata->>'credit_amount')::INTEGER;
    
    -- Add credits to user profile
    UPDATE profiles 
    SET credits = credits + credit_amount
    WHERE id = user_uuid;
    
    -- Log transaction
    INSERT INTO credit_transactions (user_id, amount, description, feature)
    VALUES (user_uuid, credit_amount, 'Credit purchase via Stripe', 'credit_purchase');
    
    RAISE NOTICE 'Added % credits to user %', credit_amount, user_uuid;
    
  -- Handle subscription payments
  ELSIF metadata->>'plan_type' IS NOT NULL THEN
    plan_type := metadata->>'plan_type';
    
    -- Update user plan
    UPDATE profiles 
    SET plan = plan_type
    WHERE id = user_uuid;
    
    -- Add monthly credits based on plan
    IF plan_type = 'entrepreneur' THEN
      UPDATE profiles 
      SET credits = credits + 50
      WHERE id = user_uuid;
      
      INSERT INTO credit_transactions (user_id, amount, description, feature)
      VALUES (user_uuid, 50, 'Monthly credits for Entrepreneur plan', 'monthly_credits');
      
    ELSIF plan_type = 'business' THEN
      UPDATE profiles 
      SET credits = credits + 200
      WHERE id = user_uuid;
      
      INSERT INTO credit_transactions (user_id, amount, description, feature)
      VALUES (user_uuid, 200, 'Monthly credits for Business plan', 'monthly_credits');
    END IF;
    
    RAISE NOTICE 'Updated user % to plan % with monthly credits', user_uuid, plan_type;
  END IF;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;