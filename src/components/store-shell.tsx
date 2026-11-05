import type { Product } from '@/types/product';
import { CurrencyProvider } from '@/lib/currency-context';
import { CartProvider } from '@/lib/cart-context';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { CheckoutDialog } from '@/components/checkout/checkout-dialog';
import { WhatsAppFloatingButton } from '@/components/home/whatsapp-button';
import { StoreProvider } from '@/lib/store-context';
import { PreviewBanner } from '@/components/preview-banner';

/** Providers + chrome shared by every public page. */
export function StoreShell({ products, preview = false, children }: { products: Product[]; preview?: boolean; children: React.ReactNode }) {
  return (
    <StoreProvider preview={preview}>
    <CurrencyProvider>
      <CartProvider products={products}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-zinc-900 focus:px-3 focus:py-2 focus:text-sm focus:text-white">
          Skip to content
        </a>
        <PreviewBanner />
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <CartDrawer />
        <CheckoutDialog />
        <WhatsAppFloatingButton />
      </CartProvider>
    </CurrencyProvider>
    </StoreProvider>
  );
}
