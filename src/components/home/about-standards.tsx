'use client';

import React from 'react';
import {
  CheckCircle2,
  FileCheck2,
  Scale,
  Microscope,
  ShieldAlert,
  Truck,
  Building2,
  HelpCircle,
  Dna,
  MessageCircle,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function AboutStandards() {
  const faqs = [
    {
      q: 'How does the WhatsApp order integration work?',
      a: 'When you build your order in the cart and click "Proceed & Place Order on WhatsApp", your order is first validated on our secure backend server (prices, stock, and destination eligibility checked). A unique reference (e.g. AZ-2026-XXXXX) is generated and logged in our PostgreSQL database. You are then automatically redirected to our WhatsApp technical desk (+44 7448 399290) with your pre-formatted order details ready to send. Our dispatch team confirms delivery and arranges payment or pro-forma invoicing.',
    },
    {
      q: 'Are your peptides third-party tested?',
      a: 'Yes. Every batch lot produced is tested by independent analytical laboratories using High-Performance Liquid Chromatography (HPLC) to establish purity (>99%) and Electrospray Ionization Mass Spectrometry (ESI-MS) to verify molecular mass. Certificates of Analysis (COAs) with full chromatograms are viewable directly on our site.',
    },
    {
      q: 'What formats are available for ordering?',
      a: 'Peptides are available as single lyophilized vials (e.g. 5mg, 10mg, 15mg) or as 10-Vial Research Kit Boxes, which provide a 20% bundle discount for sustained laboratory investigations.',
    },
    {
      q: 'How are orders dispatched to the UK and EU?',
      a: 'UK orders are dispatched via Royal Mail Tracked 24 or priority express courier with protective insulated packaging. European Union orders are shipped via tracked international couriers with customs-compliant declarations and temperature monitoring.',
    },
    {
      q: 'What is the required storage condition for lyophilized peptides?',
      a: 'Lyophilized (freeze-dried) peptide cakes should be stored in a dry, dark desiccator at -20 °C for maximum long-term stability (up to 24 months). Once reconstituted in sterile or bacteriostatic water, store at 2–8 °C and avoid repeated freeze-thaw cycles.',
    },
    {
      q: 'What is the compliance restriction regarding research peptides?',
      a: 'All peptides and reagents supplied by AZ Labs are strictly restricted to qualified in-vitro laboratory research, chemical characterization, and analytical testing. They are NOT for human consumption, medical diagnosis, clinical trials, or veterinary applications.',
    },
  ];

  return (
    <section id="standards" className="py-20 border-b border-zinc-900 bg-zinc-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Quality Assurance Pillars */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              Quality Control & Testing Standards
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
              Scientific Rigour & Purity Verification
            </h2>
            <p className="mt-3 text-sm text-zinc-400">
              Our peptide synthesis and analytical verification protocols match the highest standards in scientific reagent distribution, with every lot backed by comprehensive HPLC and MS data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/40 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-4">
                <Microscope className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Reverse-Phase HPLC Purity</h3>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Purity is verified by analytical reverse-phase HPLC (C18 column, UV detection at 214 nm). Only batches achieving &ge;99.0% peak area purity are approved for cataloguing.
              </p>
              <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] font-mono text-emerald-400">
                Purity Standard: &ge; 99.0% to 99.8%
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/40 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-4">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">ESI Mass Spectrometry</h3>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Electrospray Ionization Mass Spectrometry (ESI-MS) confirms the exact molecular weight and amino acid sequence fidelity, ruling out truncated peptides or deletion variants.
              </p>
              <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] font-mono text-emerald-400">
                Mass Accuracy: &plusmn; 0.5 Da confirmation
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/40 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-4">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">UK & EU Tracked Cold Logistics</h3>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                All lyophilized peptide vials are packaged with desiccant in airtight foil pouches and shipped in temperature-shielded mailers to ensure stability throughout transit.
              </p>
              <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] font-mono text-emerald-400">
                UK 24h & EU Express Tracked
              </div>
            </div>
          </div>
        </div>

        {/* Corporate Overview & Domain Notice */}
        <div id="about" className="pt-10 border-t border-zinc-900 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              About AZ Labs
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Precision Reagent Supply for UK & EU Researchers
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Operating under domain <strong className="text-white font-mono">azlabs.pro</strong>, AZ Labs is a specialized scientific supplier serving university laboratories, biotech researchers, and testing institutions across the United Kingdom and authorized European Union destinations.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We focus exclusively on genuine purity, batch traceability, and rapid order processing. By connecting directly with our UK WhatsApp coordination desk (<strong className="text-emerald-400 font-mono">+44 7448 399290</strong>), customers receive instant technical confirmation, batch Certificates of Analysis, and transparent dispatch updates without retail delays.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>UK Based Supply Entity</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Direct WhatsApp Desk: +44 7448 399290</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>10-Vial Research Kit Sets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Verified HPLC Batch Reports</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider">
                <Building2 className="h-4 w-4" />
                <span>Eligible Dispatch Territories</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                AZ Labs accepts orders strictly from approved jurisdictions where research peptides comply with regional directives.
              </p>
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <div className="font-semibold text-zinc-200">Current Scope:</div>
                <div>• 🇬🇧 United Kingdom (Tracked express domestic courier)</div>
                <div>• 🇪🇺 European Union: Germany, France, Netherlands, Ireland, Belgium, Italy, Spain, Austria & Switzerland</div>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions (FAQ) Section */}
        <div className="pt-10 border-t border-zinc-900 space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1.5">
              <HelpCircle className="h-4 w-4" />
              Frequently Asked Questions
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Peptide Ordering & Logistics Information
            </h3>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`item-${idx}`}
                  className="rounded-xl border border-zinc-850 bg-zinc-900/50 px-4 py-1"
                >
                  <AccordionTrigger className="text-left text-sm font-semibold text-zinc-200 hover:text-emerald-400 hover:no-underline font-sans">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-zinc-400 leading-relaxed pt-1 pb-3">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Regulatory & Compliance Notice (Inspired by Vitralab Research) */}
        <div id="regulatory" className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
            <Scale className="h-4 w-4" />
            <span>Strict In-Vitro Laboratory Research Declaration</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            All peptides and biochemical compounds distributed by AZ Labs (azlabs.pro) are intended strictly for in-vitro laboratory research, analytical chromatography, cell culture investigation, and scientific evaluation. They are explicitly NOT drugs, food additives, cosmetic preparations, or dietary supplements, and must NOT be administered to humans or animals under any circumstances.
          </p>
          <p className="text-[11px] text-zinc-500 font-mono">
            Purchasers must be at least 21 years of age and represent qualified laboratory, university, or commercial scientific institutions. Orders are subject to verification prior to dispatch.
          </p>
        </div>
      </div>
    </section>
  );
}
