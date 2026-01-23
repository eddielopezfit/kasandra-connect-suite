-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create lead_profiles table for unified lead management
CREATE TABLE public.lead_profiles (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contact info
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT,
  language TEXT DEFAULT 'en',
  
  -- Qualification
  intent TEXT CHECK (intent IN ('buy', 'sell', 'cash', 'explore')),
  timeline TEXT CHECK (timeline IN ('asap', '30_days', '60_90', 'exploring')),
  situation TEXT CHECK (situation IN ('inherited', 'divorce', 'tired_landlord', 'none')),
  condition TEXT CHECK (condition IN ('move_in_ready', 'minor_repairs', 'distressed')),
  
  -- Scoring
  lead_score INTEGER DEFAULT 0,
  lead_grade TEXT CHECK (lead_grade IN ('A', 'B', 'C', 'D')),
  tags TEXT[] DEFAULT '{}',
  
  -- Verification
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  verification_expires_at TIMESTAMPTZ,
  
  -- Source tracking
  source TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  session_id TEXT,
  
  -- CRM sync
  ghl_contact_id TEXT,
  ghl_synced_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lead_profiles ENABLE ROW LEVEL SECURITY;

-- Allow anonymous INSERT
CREATE POLICY "Anyone can create a lead profile"
ON public.lead_profiles
FOR INSERT
WITH CHECK (true);

-- Allow anonymous UPDATE (for verification flow, progressive profiling)
CREATE POLICY "Anyone can update lead profiles"
ON public.lead_profiles
FOR UPDATE
USING (true)
WITH CHECK (true);

-- No public SELECT policy (leads are private)

-- Create trigger for automatic updated_at
CREATE TRIGGER update_lead_profiles_updated_at
BEFORE UPDATE ON public.lead_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index on email for fast lookups
CREATE INDEX idx_lead_profiles_email ON public.lead_profiles(email);

-- Create index on session_id for session-based queries
CREATE INDEX idx_lead_profiles_session_id ON public.lead_profiles(session_id);

-- Create index on lead_grade for filtering high-value leads
CREATE INDEX idx_lead_profiles_lead_grade ON public.lead_profiles(lead_grade);