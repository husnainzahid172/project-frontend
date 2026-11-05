import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import '@fontsource-variable/manrope';
import '@fontsource-variable/jetbrains-mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SITE } from '@/lib/site-config';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `AZ Labs | ${SITE.tagline}`, template: '%s | AZ Labs' },
  description: 'AZ Labs: peptides and laboratory reagents in the UK and EU. Clear specifications and straightforward communication.',
  applicationName: 'AZ Labs',
  openGraph: {
    type: 'website',
    siteName: 'AZ Labs',
    title: `AZ Labs | ${SITE.tagline}`,
    description: 'Peptides and laboratory reagents. Clear specifications and straightforward communication.',
    url: SITE.url,
    images: [{ url: '/images/og.png', width: 1200, height: 630, alt: 'AZ Labs' }],
    locale: 'en_GB',
  },
  twitter: { card: 'summary_large_image', title: `AZ Labs | ${SITE.tagline}`, images: ['/images/og.png'] },
  icons: { icon: '/favicon.ico', apple: '/images/apple-touch-icon.png' },
};

export const viewport: Viewport = { themeColor: '#1f2125', colorScheme: 'dark' };

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.company.legalName ?? 'AZ Labs',
  url: SITE.url,
  logo: `${SITE.url}/images/az-labs-mark.png`,
  slogan: SITE.tagline,
  email: SITE.email,
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', telephone: SITE.whatsappDisplay.replace(/\s/g, ''), email: SITE.email, areaServed: ['GB', 'EU'] }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className="dark scroll-smooth">
      <body className="min-h-screen bg-background font-sans text-foreground">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
