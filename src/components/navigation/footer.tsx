'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AzLabsLogo } from '@/components/brand/logo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mail, Phone, MapPin, ShieldCheck, FileText, Lock, Globe } from 'lucide-react';

export function Footer() {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'shipping' | null>(null);

  return (
    <footer id="contact" className="border-t border-zinc-900 bg-black text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <AzLabsLogo showTagline size="lg" />
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mt-3">
              AZ Labs (<strong className="text-zinc-200">azlabs.pro</strong>) is a UK-based supplier of high-purity research peptides, analytical standards, and biochemical solutions. We deliver to verified laboratories and research facilities across the UK and authorized European Union destinations.
            </p>
            <div className="pt-2 text-[11px] font-mono text-zinc-500 space-y-1">
              <div>AZ Labs • Web: azlabs.pro</div>
              <div>Tagline: Research. Refined.</div>
              <div>UK REACH & CLP Compliant • HPLC & MS Certified</div>
            </div>
          </div>

          {/* Direct Laboratory Contact */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              WhatsApp & Desk Contact
            </h4>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <a
                  href="https://wa.me/447448399290"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors font-mono"
                >
                  +44 7448 399290 (WhatsApp Direct)
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                <a href="mailto:orders@azlabs.pro" className="hover:text-emerald-400 transition-colors font-mono">
                  orders@azlabs.pro
                </a>
              </li>
              <li className="flex items-start gap-2 text-zinc-400">
                <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>AZ Labs Analytical Logistics, Oxford Science Park, OX4 4GA, United Kingdom</span>
              </li>
              <li className="flex items-center gap-2 text-zinc-400">
                <Globe className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-mono text-emerald-400">azlabs.pro</span>
              </li>
            </ul>
          </div>

          {/* Regulatory & Policies */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              Governance & Policies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveModal('shipping')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  UK & EU Cold-Chain Shipping
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('privacy')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Privacy Policy & GDPR
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('terms')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Terms & Research Use Only (21+)
                </button>
              </li>
              <li>
                <a href="#standards" className="hover:text-emerald-400 transition-colors">
                  HPLC & Mass Spec Quality Control
                </a>
              </li>
            </ul>
          </div>

          {/* Portals & Catalogue */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#catalogue" className="hover:text-emerald-400 transition-colors">
                  Peptide Catalogue (BPC, TB, GLP)
                </a>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 font-mono"
                >
                  <Lock className="h-3 w-3" />
                  <span>Admin Order Registry</span>
                </Link>
              </li>
              <li className="pt-2 text-[11px] text-zinc-500 font-mono">
                Serving United Kingdom & Eligible EU Members
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} AZ Labs (azlabs.pro). All rights reserved. “Research. Refined.” is a trademark of AZ Labs.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-500/80">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>In-Vitro Laboratory Research Reagents Only • Age 21+ Required</span>
            </span>
          </div>
        </div>
      </div>

      {/* Policy Modals */}
      <Dialog open={!!activeModal} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-2xl bg-zinc-950 border border-zinc-850 text-zinc-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white font-mono">
              {activeModal === 'privacy' && 'AZ Labs — Privacy Policy & GDPR Protection'}
              {activeModal === 'terms' && 'AZ Labs — Terms of Service & Research Use Policy (21+)'}
              {activeModal === 'shipping' && 'AZ Labs — UK & EU Shipping & Cold-Chain Protocol'}
            </DialogTitle>
          </DialogHeader>

          <div className="text-xs text-zinc-300 space-y-3 max-h-[60vh] overflow-y-auto pr-2 leading-relaxed font-sans">
            {activeModal === 'privacy' && (
              <>
                <p>
                  AZ Labs (azlabs.pro) respects your privacy and adheres to the UK Data Protection Act 2018 and the General Data Protection Regulation (GDPR).
                </p>
                <p>
                  <strong>Data Use:</strong> Contact and delivery details collected during WhatsApp order processing are utilized strictly for order verification, invoicing, and courier delivery. We do not sell or monetize researcher data to third parties.
                </p>
              </>
            )}

            {activeModal === 'terms' && (
              <>
                <p>
                  <strong>1. Age & Qualification:</strong> All purchasers must be at least 21 years of age and qualified researchers, scientific professionals, or representatives of research organizations.
                </p>
                <p>
                  <strong>2. Research Use Only:</strong> All products, including synthetic peptides and co-lyophilized mixtures, are intended solely for in-vitro laboratory research, analytical testing, and scientific studies. None of the products offered are intended or approved for human or animal consumption, medical therapy, or cosmetic use.
                </p>
                <p>
                  <strong>3. Order Confirmation:</strong> Placing an inquiry on azlabs.pro and opening WhatsApp initiates direct coordination with our UK desk. Formal order confirmation and payment occur upon verified review.
                </p>
              </>
            )}

            {activeModal === 'shipping' && (
              <>
                <p>
                  <strong>Domestic UK Shipping:</strong> Dispatched from our UK facility via Royal Mail Tracked 24 or dedicated express logistics.
                </p>
                <p>
                  <strong>European Union Delivery:</strong> Dispatched to authorized EU member states via tracked international courier with customs declarations.
                </p>
                <p>
                  <strong>Cold-Chain Protection:</strong> Peptides are sealed with desiccant in foil pouches inside insulated mailers to ensure stability during transport.
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
