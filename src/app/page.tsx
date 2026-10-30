import React from 'react';
import { fetchProducts } from '@/lib/supabase';
import { Navbar } from '@/components/navigation/navbar';
import { Hero } from '@/components/home/hero';
import { ProductGrid } from '@/components/catalogue/product-grid';
import { QuickOrderSection } from '@/components/home/quick-order-section';
import { AboutStandards } from '@/components/home/about-standards';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { CheckoutDialog } from '@/components/checkout/checkout-dialog';
import { WhatsAppFloatingButton } from '@/components/home/whatsapp-button';
import { ComplianceGate } from '@/components/home/compliance-gate';
import { Footer } from '@/components/navigation/footer';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await fetchProducts();

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* 21+ In-Vitro Research Compliance Modal */}
      <ComplianceGate />

      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Product Catalogue with Search & Filters */}
        <ProductGrid initialProducts={products} />

        {/* Direct WhatsApp Order Builder */}
        <QuickOrderSection products={products} />

        {/* Quality Assurance, HPLC Standards & FAQ */}
        <AboutStandards />
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* Order Checkout Dialog */}
      <CheckoutDialog />

      {/* Floating WhatsApp Quick Action Button */}
      <WhatsAppFloatingButton />

      {/* Footer */}
      <Footer />
    </div>
  );
}
