import { NextResponse } from 'next/server';
import { getServerAuthClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const sb = await getServerAuthClient();
  if (sb) await sb.auth.signOut();
  return NextResponse.redirect(new URL('/admin/login', req.url), { status: 303 });
}
