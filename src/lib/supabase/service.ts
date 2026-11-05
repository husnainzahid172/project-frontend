import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './config';

/**
 * Service-role client. Bypasses RLS, so it must only ever run on the server.
 * The `server-only` import makes the build fail if a client component imports this file.
 * Used for: order creation (via the create_order RPC) and admin operations AFTER requireAdmin().
 */
let client: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!SUPABASE_URL || !key) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}
