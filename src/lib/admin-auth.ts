import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function getAdminUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('id, user_id, email, role')
    .eq('user_id', user.id)
    .maybeSingle();

  return profile ? { user, profile } : null;
}

export async function requireAdminUser() {
  const admin = await getAdminUser();
  if (!admin) throw new Error('Unauthorized');
  return admin;
}

export async function requireAdminWrite() {
  const admin = await requireAdminUser();
  if (admin.profile.role === 'auditor') throw new Error('Forbidden');
  return admin;
}
