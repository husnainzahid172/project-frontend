'use client';
import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

export function getBrowserClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
