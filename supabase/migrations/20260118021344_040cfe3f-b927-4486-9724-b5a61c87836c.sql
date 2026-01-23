-- Create seller_leads table for storing funnel submissions
CREATE TABLE public.seller_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  situation TEXT,
  condition TEXT,
  timeline TEXT,
  estimated_value TEXT,
  calculated_cash_offer INTEGER,
  calculated_listing_net INTEGER,
  source TEXT DEFAULT 'seller_funnel',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.seller_leads ENABLE ROW LEVEL SECURITY;

-- Create policy for insert (public can insert - this is a lead capture form)
CREATE POLICY "Anyone can submit a seller lead" 
ON public.seller_leads 
FOR INSERT 
WITH CHECK (true);

-- No SELECT policy for public - leads are private to admin/backend only
-- Service role can still access all data