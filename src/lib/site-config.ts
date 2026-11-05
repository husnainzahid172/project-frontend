/**
 * Business details shown on the site. Only confirmed facts go here.
 * Fields left null are simply not rendered. UK companies must display their registered name,
 * company number and registered office on their website (Companies Act 2006 trading disclosures),
 * so fill these in before launch.
 */
export const SITE = {
  brand: 'AZ Labs',
  tagline: 'Research. Refined.',
  domain: 'azlabs.pro',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://azlabs.pro',
  email: 'orders@azlabs.pro',
  whatsappDisplay: '+44 7448 399290',
  whatsappE164: '447448399290',
  company: {
    legalName: null as string | null,
    companyNumber: null as string | null,
    registeredOffice: null as string | null,
    vatNumber: null as string | null,
  },
};

export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${SITE.whatsappE164}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
