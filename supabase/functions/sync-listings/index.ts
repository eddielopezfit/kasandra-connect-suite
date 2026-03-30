import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Admin secret guard — prevents unauthorized triggers
  const adminSecret = req.headers.get('x-admin-secret')
  if (adminSecret !== Deno.env.get('ADMIN_SECRET')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // TODO: Replace this block with IDX Broker API call when ready
  // const idxApiKey = Deno.env.get('IDX_BROKER_API_KEY')
  // const response = await fetch('https://api.idxbroker.com/clients/listings', {
  //   headers: { 'accesskey': idxApiKey, 'outputtype': 'json' }
  // })
  // const listings = await response.json()
  // ... upsert listings into featured_listings table using SERVICE_ROLE_KEY

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  return new Response(
    JSON.stringify({
      status: 'manual_mode',
      message: 'IDX integration pending. Listings are managed manually via database.',
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
