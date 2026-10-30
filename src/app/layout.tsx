import type { Metadata } from 'next';
import './globals.css';
import { CurrencyProvider } from '@/lib/currency-context';
import { CartProvider } from '@/lib/cart-context';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'AZ Labs — Research. Refined. | UK & EU Peptides Supply',
  description:
    'High-purity lyophilized research peptides and biochemical sequences (BPC-157, TB-500, GLP3-RT, Tirzepatide, GHK-Cu, NAD+). In-vitro laboratory supply for verified UK and EU research facilities. Direct WhatsApp order dispatch.',
  keywords: [
    'AZ Labs',
    'azlabs.pro',
    'peptides UK',
    'peptides EU',
    'BPC-157',
    'TB-500',
    'GLP3-RT',
    'Retatrutide research sequence',
    'Tirzepatide peptide',
    'GHK-Cu copper peptide',
    'NAD+ coenzyme',
    '10-vial peptide kits',
    'HPLC certified peptides',
    'in-vitro research peptides',
  ],
  authors: [{ name: 'AZ Labs (azlabs.pro)' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased h-full bg-black text-zinc-100">
        <CurrencyProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
