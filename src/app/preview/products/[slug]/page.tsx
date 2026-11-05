import { notFound, redirect } from 'next/navigation';
import { getPreviewAccess, getPreviewProducts } from '@/lib/preview';
import { StoreShell } from '@/components/store-shell';
import { ProductDetail } from '@/components/catalogue/product-detail';

export const dynamic = 'force-dynamic';

export default async function PreviewProduct({ params }: { params: Promise<{ slug: string }> }) {
  const access = await getPreviewAccess();
  if (!access) redirect('/admin/login');
  const { slug } = await params;
  const products = await getPreviewProducts(access);
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  return (
    <StoreShell products={products} preview>
      <ProductDetail product={product} />
    </StoreShell>
  );
}
