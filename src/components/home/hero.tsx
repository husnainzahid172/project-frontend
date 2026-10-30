'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowDown,
  ShieldCheck,
  Award,
  FileCheck2,
  ThermometerSnowflake,
  MessageCircle,
  Dna,
  Sparkles,
} from 'lucide-react';
import { getWhatsAppNumber } from '@/lib/order-service';

export function Hero() {
  const handleDirectWhatsApp = () => {
    const phone = getWhatsAppNumber();
    const message = encodeURIComponent(
      'Hello AZ Labs (azlabs.pro), I would like to inquire about peptide stock, 10-vial kit boxes, and batch CoA reports.'
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-zinc-900 bg-black">
      {/* Precision Background Aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.18),rgba(0,0,0,0))]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Precision Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-8 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>UK & EU Peptide Supply • In-Vitro Research & Analytical Testing Only</span>
        </div>

        {/* Tagline & Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          <span className="block text-zinc-300 font-light text-2xl sm:text-3xl md:text-4xl mb-3 tracking-wide font-sans">
            Research. Refined.
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
            AZ Labs Peptides
          </span>
        </h1>

        {/* Supporting Narrative */}
        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Ultra-high purity lyophilized peptides and analytical reference sequences. Third-party verified by HPLC & Mass Spectrometry (>99% purity) with batch Certificates of Analysis (COAs). Order on-site with direct WhatsApp instant fulfillment.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-8 py-6 rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.35)] text-sm"
          >
            <a href="#catalogue" className="flex items-center gap-2">
              <Dna className="h-4 w-4" />
              <span>Explore Peptide Catalogue</span>
              <ArrowDown className="h-4 w-4" />
            </a>
          </Button>

          <Button
            onClick={handleDirectWhatsApp}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-zinc-800 bg-zinc-950/70 hover:bg-zinc-900 text-zinc-200 hover:text-white px-8 py-6 rounded-xl text-sm gap-2"
          >
            <MessageCircle className="h-4 w-4 text-emerald-400" />
            <span>Order via WhatsApp (+44 7448 399290)</span>
          </Button>
        </div>

        {/* Four Trust Metrics Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-8 border-t border-zinc-900/80">
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850/80 text-left">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Award className="h-4 w-4" />
              <span className="font-mono text-xs font-semibold">Purity Standard</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">&gt;= 99.0%</div>
            <div className="text-[11px] text-zinc-400">HPLC & MS 3rd-party verified</div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850/80 text-left">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <FileCheck2 className="h-4 w-4" />
              <span className="font-mono text-xs font-semibold">COA Transparency</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">100% Batch Tested</div>
            <div className="text-[11px] text-zinc-400">Independent lab chromatograms</div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850/80 text-left">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <ThermometerSnowflake className="h-4 w-4" />
              <span className="font-mono text-xs font-semibold">Cold-Chain Dispatch</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">UK & EU Tracked</div>
            <div className="text-[11px] text-zinc-400">Thermal insulated packaging</div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850/80 text-left">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Sparkles className="h-4 w-4" />
              <span className="font-mono text-xs font-semibold">Kits & Bulk Savings</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">10-Vial Kit Boxes</div>
            <div className="text-[11px] text-zinc-400">Save 20% on research sets</div>
          </div>
        </div>
      </div>
    </section>
  );
}
