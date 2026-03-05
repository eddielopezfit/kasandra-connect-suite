/**
 * Bridge authenticated user identity to lead profile
 * Ensures continuity between Google auth and existing lead_id
 */

import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { logEvent } from "./logEvent";

export async function bridgeAuthToLead(user: User): Promise<string | null> {
  try {
    // Check if lead already exists with selena_lead_id
    const existingLeadId = localStorage.getItem('selena_lead_id');
    
    // Upsert to lead_profiles with auth email
    const { data, error } = await supabase.functions.invoke('upsert-lead-profile', {
      body: {
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
        source: 'google_auth',
        existing_lead_id: existingLeadId,
      },
    });

    if (error) {
      console.error('[bridgeAuthToLead] Error upserting lead:', error);
      return existingLeadId;
    }

    if (data?.lead_id) {
      // Update localStorage with the lead_id from backend
      localStorage.setItem('selena_lead_id', data.lead_id);
      
      logEvent('auth_lead_bridge_success', {
        lead_id: data.lead_id,
        email: user.email,
        had_existing_id: !!existingLeadId,
      });
      
      if (import.meta.env.DEV) console.log('[bridgeAuthToLead] Lead ID bridged:', data.lead_id);
      return data.lead_id;
    }

    return existingLeadId;
  } catch (e) {
    console.error('[bridgeAuthToLead] Unexpected error:', e);
    return localStorage.getItem('selena_lead_id');
  }
}
