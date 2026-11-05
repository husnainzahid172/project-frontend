import { FileCheck2, Layers, MessageSquare } from 'lucide-react';
import { SITE } from '@/lib/site-config';

const PRINCIPLES = [
  {
    icon: FileCheck2,
    title: 'Verified Quality',
    body: 'Products are manufactured to strict research standards with verified chemical specifications and consistent purity.',
  },
  {
    icon: Layers,
    title: 'Clear specifications',
    body: 'Each listing shows the compound identity (CAS number, formula, molecular weight and sequence) and the unit size, without inflated claims.',
  },
  {
    icon: MessageSquare,
    title: 'Direct WhatsApp Support',
    body: 'Questions about orders, pricing, or availability go directly to our UK desk on WhatsApp.',
  },
];

export function QualitySection() {
  return (
    <section id="quality" className="scroll-mt-20 border-t border-white/10 py-20 sm:py-24">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">Quality &amp; Standards</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">How we work</h2>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
          {PRINCIPLES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-card p-7 sm:p-8">
              <Icon className="h-5 w-5 text-emerald-400" aria-hidden />
              <h3 className="mt-5 font-display text-lg font-semibold text-zinc-50">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutSection() {
  const c = SITE.company;
  return (
    <section id="about" className="scroll-mt-20 border-t border-white/10 py-20 sm:py-24">
      <div className="container-page grid gap-12 md:grid-cols-2">
        <div>
          <p className="eyebrow">About</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">AZ Labs</h2>
        </div>
        <div className="space-y-5 text-[15px] leading-relaxed text-zinc-300">
          <p>
            AZ Labs serves customers in the UK and EU with peptides and laboratory reagents. We keep the catalogue deliberately
            small so that every listing can be properly specified and documented.
          </p>
          <p>Our tagline is our standard: <span className="text-zinc-100">{SITE.tagline}</span></p>
          {(c.legalName || c.companyNumber || c.registeredOffice) && (
            <dl className="grid gap-2 border-t border-white/10 pt-5 text-sm">
              {c.legalName && <div className="flex gap-3"><dt className="w-36 text-zinc-400">Company</dt><dd className="text-zinc-200">{c.legalName}</dd></div>}
              {c.companyNumber && <div className="flex gap-3"><dt className="w-36 text-zinc-400">Company number</dt><dd className="text-zinc-200">{c.companyNumber}</dd></div>}
              {c.registeredOffice && <div className="flex gap-3"><dt className="w-36 text-zinc-400">Registered office</dt><dd className="text-zinc-200">{c.registeredOffice}</dd></div>}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
