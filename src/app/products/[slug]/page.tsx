import { notFound } from 'next/navigation';
import { fetchProductById } from '@/lib/supabase';
import { isPubliclyVisible } from '@/lib/eligibility';
import { ProductDetail } from '@/components/catalogue/product-detail';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProductById(slug);
  if (!product || !isPubliclyVisible(product.eligibility_status)) notFound();
  return <ProductDetail product={product} />;
}
