-- Create validation_requests table
CREATE TABLE IF NOT EXISTS validation_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entrepreneur_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'fintech', 'healthtech', 'edtech', 'sustainability', 
    'ecommerce', 'saas', 'marketplace', 'social', 'gaming', 'other'
  )),
  target_audience TEXT NOT NULL,
  validation_type TEXT NOT NULL CHECK (validation_type IN (
    'feedback', 'survey', 'interview', 'prototype_test', 'usability_test'
  )),
  reward_points INTEGER DEFAULT 50 CHECK (reward_points >= 0),
  max_responses INTEGER DEFAULT 100 CHECK (max_responses > 0),
  requirements TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create early_adopters table (extends user profiles)
CREATE TABLE IF NOT EXISTS early_adopters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  expertise_areas TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  completed_validations INTEGER DEFAULT 0 CHECK (completed_validations >= 0),
  total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
  hourly_rate DECIMAL(10,2),
  portfolio_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create validation_participants table (many-to-many)
CREATE TABLE IF NOT EXISTS validation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  validation_request_id UUID REFERENCES validation_requests(id) ON DELETE CASCADE,
  adopter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(validation_request_id, adopter_id)
);

-- Create validation_responses table
CREATE TABLE IF NOT EXISTS validation_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  validation_request_id UUID REFERENCES validation_requests(id) ON DELETE CASCADE,
  adopter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  response_data JSONB NOT NULL,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  time_spent_minutes INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(validation_request_id, adopter_id)
);

-- Create marketplace_rewards table
CREATE TABLE IF NOT EXISTS marketplace_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  validation_response_id UUID REFERENCES validation_responses(id) ON DELETE SET NULL,
  points_awarded INTEGER NOT NULL CHECK (points_awarded > 0),
  reward_type TEXT NOT NULL CHECK (reward_type IN (
    'response_submitted', 'response_approved', 'quality_bonus', 
    'speed_bonus', 'referral_bonus', 'milestone_bonus'
  )),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketplace_analytics table
CREATE TABLE IF NOT EXISTS marketplace_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  validation_request_id UUID REFERENCES validation_requests(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  metric_data JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_validation_requests_entrepreneur ON validation_requests(entrepreneur_id);
CREATE INDEX IF NOT EXISTS idx_validation_requests_category ON validation_requests(category);
CREATE INDEX IF NOT EXISTS idx_validation_requests_status ON validation_requests(status);
CREATE INDEX IF NOT EXISTS idx_validation_requests_created_at ON validation_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_early_adopters_user_id ON early_adopters(user_id);
CREATE INDEX IF NOT EXISTS idx_early_adopters_availability ON early_adopters(availability);
CREATE INDEX IF NOT EXISTS idx_early_adopters_rating ON early_adopters(rating DESC);
CREATE INDEX IF NOT EXISTS idx_early_adopters_interests ON early_adopters USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_early_adopters_expertise ON early_adopters USING GIN(expertise_areas);

CREATE INDEX IF NOT EXISTS idx_validation_participants_request ON validation_participants(validation_request_id);
CREATE INDEX IF NOT EXISTS idx_validation_participants_adopter ON validation_participants(adopter_id);

CREATE INDEX IF NOT EXISTS idx_validation_responses_request ON validation_responses(validation_request_id);
CREATE INDEX IF NOT EXISTS idx_validation_responses_adopter ON validation_responses(adopter_id);
CREATE INDEX IF NOT EXISTS idx_validation_responses_status ON validation_responses(status);

CREATE INDEX IF NOT EXISTS idx_marketplace_rewards_user ON marketplace_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_rewards_type ON marketplace_rewards(reward_type);

-- Create RLS policies
ALTER TABLE validation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE early_adopters ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_analytics ENABLE ROW LEVEL SECURITY;

-- Validation requests policies
CREATE POLICY "Users can view all active validation requests" ON validation_requests
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create their own validation requests" ON validation_requests
  FOR INSERT WITH CHECK (auth.uid() = entrepreneur_id);

CREATE POLICY "Users can update their own validation requests" ON validation_requests
  FOR UPDATE USING (auth.uid() = entrepreneur_id);

CREATE POLICY "Users can delete their own validation requests" ON validation_requests
  FOR DELETE USING (auth.uid() = entrepreneur_id);

-- Early adopters policies
CREATE POLICY "Users can view all early adopters" ON early_adopters
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own early adopter profile" ON early_adopters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own early adopter profile" ON early_adopters
  FOR UPDATE USING (auth.uid() = user_id);

-- Validation participants policies
CREATE POLICY "Users can view participants of their requests" ON validation_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM validation_requests vr 
      WHERE vr.id = validation_request_id AND vr.entrepreneur_id = auth.uid()
    ) OR adopter_id = auth.uid()
  );

CREATE POLICY "Users can join validations" ON validation_participants
  FOR INSERT WITH CHECK (auth.uid() = adopter_id);

CREATE POLICY "Users can update their own participation" ON validation_participants
  FOR UPDATE USING (auth.uid() = adopter_id);

-- Validation responses policies
CREATE POLICY "Users can view responses to their requests" ON validation_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM validation_requests vr 
      WHERE vr.id = validation_request_id AND vr.entrepreneur_id = auth.uid()
    ) OR adopter_id = auth.uid()
  );

CREATE POLICY "Users can create their own responses" ON validation_responses
  FOR INSERT WITH CHECK (auth.uid() = adopter_id);

CREATE POLICY "Users can update their own responses" ON validation_responses
  FOR UPDATE USING (auth.uid() = adopter_id);

-- Marketplace rewards policies
CREATE POLICY "Users can view their own rewards" ON marketplace_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert rewards" ON marketplace_rewards
  FOR INSERT WITH CHECK (true); -- This will be restricted to service role

-- Marketplace analytics policies
CREATE POLICY "Users can view analytics for their requests" ON marketplace_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM validation_requests vr 
      WHERE vr.id = validation_request_id AND vr.entrepreneur_id = auth.uid()
    )
  );

-- Create functions for marketplace operations

-- Function to award points
CREATE OR REPLACE FUNCTION award_marketplace_points(
  user_id UUID,
  points_amount INTEGER,
  reward_type TEXT DEFAULT 'response_submitted',
  description TEXT DEFAULT NULL,
  validation_response_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insert reward record
  INSERT INTO marketplace_rewards (
    user_id, 
    points_awarded, 
    reward_type, 
    description, 
    validation_response_id
  ) VALUES (
    user_id, 
    points_amount, 
    reward_type, 
    description, 
    validation_response_id
  );
  
  -- Update early adopter total points
  UPDATE early_adopters 
  SET total_points = total_points + points_amount,
      updated_at = NOW()
  WHERE early_adopters.user_id = award_marketplace_points.user_id;
  
  -- If no early adopter profile exists, create one
  INSERT INTO early_adopters (user_id, total_points)
  VALUES (user_id, points_amount)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate adopter rating
CREATE OR REPLACE FUNCTION calculate_adopter_rating(adopter_user_id UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  avg_rating DECIMAL(3,2);
BEGIN
  SELECT COALESCE(AVG(rating), 5.0)
  INTO avg_rating
  FROM validation_responses
  WHERE adopter_id = adopter_user_id
    AND status = 'approved'
    AND rating IS NOT NULL;
  
  -- Update the early adopter profile
  UPDATE early_adopters
  SET rating = avg_rating,
      updated_at = NOW()
  WHERE user_id = adopter_user_id;
  
  RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- Function to update validation completion count
CREATE OR REPLACE FUNCTION update_validation_count(adopter_user_id UUID)
RETURNS VOID AS $$
DECLARE
  completed_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO completed_count
  FROM validation_responses
  WHERE adopter_id = adopter_user_id
    AND status = 'approved';
  
  UPDATE early_adopters
  SET completed_validations = completed_count,
      updated_at = NOW()
  WHERE user_id = adopter_user_id;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update ratings and counts
CREATE OR REPLACE FUNCTION trigger_update_adopter_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    PERFORM calculate_adopter_rating(NEW.adopter_id);
    PERFORM update_validation_count(NEW.adopter_id);
    
    -- Award points for approved response
    PERFORM award_marketplace_points(
      NEW.adopter_id,
      50, -- Base points for approved response
      'response_approved',
      'Response approved by entrepreneur',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_adopter_stats_trigger
  AFTER UPDATE ON validation_responses
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_adopter_stats();

-- Function to get marketplace statistics
CREATE OR REPLACE FUNCTION get_marketplace_stats()
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'active_validations', (
      SELECT COUNT(*) FROM validation_requests WHERE status = 'active'
    ),
    'total_adopters', (
      SELECT COUNT(*) FROM early_adopters WHERE availability = 'available'
    ),
    'responses_today', (
      SELECT COUNT(*) FROM validation_responses 
      WHERE created_at >= CURRENT_DATE
    ),
    'total_points_awarded', (
      SELECT COALESCE(SUM(points_awarded), 0) FROM marketplace_rewards
    ),
    'avg_response_time_hours', (
      SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (created_at - vr.created_at))/3600), 0)
      FROM validation_responses resp
      JOIN validation_requests vr ON resp.validation_request_id = vr.id
      WHERE resp.created_at >= CURRENT_DATE - INTERVAL '30 days'
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing
INSERT INTO early_adopters (user_id, bio, interests, expertise_areas, rating, completed_validations, total_points, availability)
SELECT 
  id,
  'Passionate about innovation and helping entrepreneurs validate their ideas',
  ARRAY['fintech', 'sustainability', 'mobile-apps'],
  ARRAY['UX/UI Design', 'Product Management', 'Market Research'],
  4.8,
  15,
  750,
  'available'
FROM auth.users 
WHERE email LIKE '%@example.com' -- Only for demo users
LIMIT 1
ON CONFLICT (user_id) DO NOTHING;

COMMIT;