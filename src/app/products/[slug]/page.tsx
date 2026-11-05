import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchPublicProducts } from '@/lib/data';
import { checkPurchase } from '@/lib/eligibility';
import { SITE } from '@/lib/site-config';
import { StoreShell } from '@/components/store-shell';
import { ProductDetail } from '@/components/catalogue/product-detail';

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = (await fetchPublicProducts()).find((p) => p.slug === slug);
  if (!product) return { title: 'Not found', robots: { index: false } };
  return {
    title: `${product.name} ${product.unit_size}`,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: `${product.name} | AZ Labs`, description: product.description, url: `${SITE.url}/products/${product.slug}` },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const products = await fetchPublicProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound(); // unlisted products (pending, not approved, restricted) do not exist publicly

  const purchasable = checkPurchase(product).allowed;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    description: product.description,
    brand: { '@type': 'Brand', name: 'AZ Labs' },
    ...(purchasable
      ? { offers: { '@type': 'Offer', priceCurrency: 'GBP', price: product.price_gbp.toFixed(2), availability: 'https://schema.org/InStock', url: `${SITE.url}/products/${product.slug}` } }
      : {}),
  };

  return (
    <StoreShell products={products}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail product={product} />
    </StoreShell>
  );
}
