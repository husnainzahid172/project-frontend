import { AzLabsLogo } from '@/components/brand/logo';
import { SITE, whatsappLink } from '@/lib/site-config';

export function Footer() {
  const c = SITE.company;
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 py-14">
      <div className="container-page">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <AzLabsLogo size="sm" />
            <p className="mt-4 max-w-xs text-sm text-zinc-400">{SITE.tagline}</p>
          </div>
          <nav aria-label="Footer">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">Site</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#catalogue" className="text-zinc-300 hover:text-zinc-50">Catalogue</a></li>
              <li><a href="#quality" className="text-zinc-300 hover:text-zinc-50">Quality &amp; Standards</a></li>
              <li><a href="#about" className="text-zinc-300 hover:text-zinc-50">About</a></li>
            </ul>
          </nav>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">Contact</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href={`mailto:${SITE.email}`} className="text-zinc-300 hover:text-zinc-50">{SITE.email}</a></li>
              <li><a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-zinc-50">WhatsApp {SITE.whatsappDisplay}</a></li>
              <li className="text-zinc-400">{SITE.domain}</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-zinc-400 sm:flex-row sm:justify-between">
          <p>© {year} {c.legalName ?? 'AZ Labs'}. All rights reserved.</p>
          {(c.companyNumber || c.registeredOffice || c.vatNumber) && (
            <p>
              {[c.companyNumber && `Company no. ${c.companyNumber}`, c.registeredOffice && `Registered office: ${c.registeredOffice}`, c.vatNumber && `VAT ${c.vatNumber}`]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
