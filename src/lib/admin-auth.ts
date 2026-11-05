import 'server-only';
import { getServerAuthClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';

export type AdminSession = { userId: string; email: string; role: 'super_admin' | 'admin' | 'auditor' };

/**
 * Returns the admin session, or null if the visitor is not signed in or not in admin_profiles.
 * Uses getUser() (verified with Supabase Auth), not getSession() (unverified cookie).
 */
export async function requireAdmin(): Promise<AdminSession | null> {
  const auth = await getServerAuthClient();
  const service = getServiceClient();
  if (!auth || !service) return null;

  const { data: { user } } = await auth.auth.getUser();
  if (!user) return null;

  const { data: profile } = await service
    .from('admin_profiles')
    .select('role, email')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!profile) return null;

  return { userId: user.id, email: profile.email ?? user.email ?? '', role: profile.role };
}

export function canWrite(session: AdminSession) {
  return session.role === 'admin' || session.role === 'super_admin';
}
