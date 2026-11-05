import { redirect } from 'next/navigation';
import { getPreviewAccess, getPreviewProducts } from '@/lib/preview';
import { StoreShell } from '@/components/store-shell';
import { Hero } from '@/components/home/hero';
import { ProductGrid } from '@/components/catalogue/product-grid';
import { QualitySection, AboutSection } from '@/components/home/about-standards';
import { ContactSection } from '@/components/home/contact-section';

export const dynamic = 'force-dynamic';

export default async function PreviewHome() {
  const access = await getPreviewAccess();
  if (!access) redirect('/admin/login');
  const products = await getPreviewProducts(access);
  return (
    <StoreShell products={products} preview>
      <Hero orderingOpen hasProducts />
      <ProductGrid />
      <QualitySection />
      <AboutSection />
      <ContactSection />
    </StoreShell>
  );
}
