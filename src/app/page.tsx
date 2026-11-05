import { redirect } from 'next/navigation';
import { fetchPublicProducts } from '@/lib/data';
import { checkPurchase } from '@/lib/eligibility';
import { StoreShell } from '@/components/store-shell';
import { Hero } from '@/components/home/hero';
import { ProductGrid } from '@/components/catalogue/product-grid';
import { QualitySection, AboutSection } from '@/components/home/about-standards';
import { ContactSection } from '@/components/home/contact-section';

export const revalidate = 60;

export default async function HomePage() {
  // Local testing convenience: `npm run dev` with LOCAL_PREVIEW=true opens the private preview.
  if (process.env.NODE_ENV === 'development' && process.env.LOCAL_PREVIEW === 'true') redirect('/preview');

  const products = await fetchPublicProducts();
  const orderingOpen = products.some((p) => checkPurchase(p).allowed);

  return (
    <StoreShell products={products}>
      <Hero orderingOpen={orderingOpen} hasProducts={products.length > 0} />
      <ProductGrid />
      <QualitySection />
      <AboutSection />
      <ContactSection />
    </StoreShell>
  );
}
