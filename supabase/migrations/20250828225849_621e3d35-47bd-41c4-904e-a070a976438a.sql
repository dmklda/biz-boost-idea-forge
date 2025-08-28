-- Create blog posts table
CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL,
  featured_image_url text,
  author_id uuid REFERENCES public.profiles(id),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  tags text[],
  reading_time integer,
  views_count integer DEFAULT 0,
  featured boolean DEFAULT false
);

-- Create success cases table
CREATE TABLE public.success_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  company_name text NOT NULL,
  company_logo_url text,
  founder_name text,
  founder_photo_url text,
  industry text NOT NULL,
  description text NOT NULL,
  challenge text NOT NULL,
  solution text NOT NULL,
  results text NOT NULL,
  metrics jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  author_id uuid REFERENCES public.profiles(id)
);

-- Create financial data table for admin tracking
CREATE TABLE public.financial_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  revenue numeric(10,2) DEFAULT 0,
  expenses numeric(10,2) DEFAULT 0,
  new_subscribers integer DEFAULT 0,
  active_users integer DEFAULT 0,
  churn_rate numeric(5,2) DEFAULT 0,
  mrr numeric(10,2) DEFAULT 0,
  arr numeric(12,2) DEFAULT 0,
  customer_lifetime_value numeric(10,2) DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create admin announcements table
CREATE TABLE public.admin_announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  target_audience text DEFAULT 'all' CHECK (target_audience IN ('all', 'free_users', 'premium_users', 'early_adopters')),
  active boolean DEFAULT true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id)
);

-- Create user analytics table
CREATE TABLE public.user_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  event_type text NOT NULL,
  event_data jsonb,
  session_id text,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin-only access
CREATE POLICY "Only admins can manage blog posts" ON public.blog_posts
FOR ALL USING (
  (SELECT public.is_admin(email) FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Published blog posts are viewable by everyone" ON public.blog_posts
FOR SELECT USING (status = 'published');

CREATE POLICY "Only admins can manage success cases" ON public.success_cases
FOR ALL USING (
  (SELECT public.is_admin(email) FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Published success cases are viewable by everyone" ON public.success_cases
FOR SELECT USING (status = 'published');

CREATE POLICY "Only admins can access financial data" ON public.financial_data
FOR ALL USING (
  (SELECT public.is_admin(email) FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Only admins can manage announcements" ON public.admin_announcements
FOR ALL USING (
  (SELECT public.is_admin(email) FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Active announcements are viewable by users" ON public.admin_announcements
FOR SELECT USING (
  active = true AND 
  (expires_at IS NULL OR expires_at > now()) AND
  (target_audience = 'all' OR 
   (target_audience = 'free_users' AND (SELECT plan FROM public.profiles WHERE id = auth.uid()) = 'free') OR
   (target_audience = 'premium_users' AND (SELECT plan FROM public.profiles WHERE id = auth.uid()) != 'free') OR
   (target_audience = 'early_adopters' AND EXISTS(SELECT 1 FROM public.early_adopters WHERE user_id = auth.uid() AND status = 'approved')))
);

CREATE POLICY "Only admins can access user analytics" ON public.user_analytics
FOR ALL USING (
  (SELECT public.is_admin(email) FROM public.profiles WHERE id = auth.uid())
);

-- Create functions for analytics
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'active_users_today', (SELECT COUNT(DISTINCT user_id) FROM public.user_analytics WHERE created_at >= CURRENT_DATE),
    'new_users_this_week', (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'total_ideas', (SELECT COUNT(*) FROM public.ideas),
    'ideas_this_month', (SELECT COUNT(*) FROM public.ideas WHERE created_at >= date_trunc('month', CURRENT_DATE)),
    'total_analyses', (SELECT COUNT(*) FROM public.idea_analyses),
    'early_adopters_pending', (SELECT COUNT(*) FROM public.early_adopters WHERE status = 'pending'),
    'early_adopters_approved', (SELECT COUNT(*) FROM public.early_adopters WHERE status = 'approved'),
    'total_blog_posts', (SELECT COUNT(*) FROM public.blog_posts WHERE status = 'published'),
    'total_success_cases', (SELECT COUNT(*) FROM public.success_cases WHERE status = 'published'),
    'total_revenue_this_month', (
      SELECT COALESCE(SUM(revenue), 0) 
      FROM public.financial_data 
      WHERE date >= date_trunc('month', CURRENT_DATE)
    ),
    'mrr', (
      SELECT revenue 
      FROM public.financial_data 
      WHERE date = (SELECT MAX(date) FROM public.financial_data)
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX idx_success_cases_status ON public.success_cases(status);
CREATE INDEX idx_financial_data_date ON public.financial_data(date);
CREATE INDEX idx_user_analytics_created_at ON public.user_analytics(created_at);
CREATE INDEX idx_user_analytics_user_id ON public.user_analytics(user_id);