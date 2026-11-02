import React from 'react';
import { fetchAllOrders, fetchProducts } from '@/lib/supabase';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: 'Admin Console | AZ Labs',
  description: 'AZ Labs Order Management & Catalogue Registry Console.',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!(await getAdminUser())) redirect('/admin/login');

  const [orders, products] = await Promise.all([
    fetchAllOrders(),
    fetchProducts(),
  ]);

  return <AdminDashboard initialOrders={orders} initialProducts={products} />;
}
