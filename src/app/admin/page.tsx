import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { adminFetchAudit, adminFetchOrders, adminFetchProducts } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <main className="container-page py-24">
        <h1 className="font-display text-2xl text-white">Admin unavailable</h1>
        <p className="mt-3 text-sm text-zinc-500">Configure Supabase environment variables to enable the admin console.</p>
      </main>
    );
  }

  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  const [orders, products, audit] = await Promise.all([adminFetchOrders(), adminFetchProducts(), adminFetchAudit()]);
  return <AdminDashboard session={admin} initialOrders={orders} initialProducts={products} audit={audit} />;
}
