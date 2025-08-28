-- Create guides table
CREATE TABLE public.guides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'beginner',
  reading_time INTEGER DEFAULT 5,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create webinars table
CREATE TABLE public.webinars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  speaker_name TEXT NOT NULL,
  speaker_bio TEXT,
  speaker_photo_url TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  registration_url TEXT,
  recording_url TEXT,
  thumbnail_url TEXT,
  max_attendees INTEGER DEFAULT 100,
  current_attendees INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;

-- Create policies for guides
CREATE POLICY "Published guides are viewable by everyone" 
ON public.guides 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Only admins can manage guides" 
ON public.guides 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND is_admin(profiles.email)
  )
);

-- Create policies for webinars
CREATE POLICY "Published webinars are viewable by everyone" 
ON public.webinars 
FOR SELECT 
USING (status IN ('scheduled', 'live', 'completed'));

CREATE POLICY "Only admins can manage webinars" 
ON public.webinars 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND is_admin(profiles.email)
  )
);

-- Create indexes for better performance
CREATE INDEX idx_guides_status ON public.guides(status);
CREATE INDEX idx_guides_featured ON public.guides(featured);
CREATE INDEX idx_guides_category ON public.guides(category);
CREATE INDEX idx_webinars_status ON public.webinars(status);
CREATE INDEX idx_webinars_featured ON public.webinars(featured);
CREATE INDEX idx_webinars_scheduled_date ON public.webinars(scheduled_date);