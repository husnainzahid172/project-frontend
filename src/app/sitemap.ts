import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site-config';
import { fetchPublicProducts } from '@/lib/data';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchPublicProducts();
  return [
    { url: SITE.url, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    ...products.map((p) => ({ url: `${SITE.url}/products/${p.slug}`, lastModified: p.updated_at ? new Date(p.updated_at) : new Date(), changeFrequency: 'weekly' as const, priority: 0.8 })),
  ];
}
