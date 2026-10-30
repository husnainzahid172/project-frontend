'use client';

import React, { useState } from 'react';
import { Product } from '@/types/product';
import { ProductFormat } from '@/types/order';
import { ProductImage } from './product-image';
import { useCurrency } from '@/lib/currency-context';
import { useCart } from '@/lib/cart-context';
import { ELIGIBLE_COUNTRIES } from '@/lib/products-data';
import { getWhatsAppNumber } from '@/lib/order-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldAlert,
  FileText,
  Minus,
  Plus,
  ShoppingCart,
  Globe2,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Dna,
  Sparkles,
  BarChart3,
} from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { formatPrice, currency } = useCurrency();
  const { addItem, setIsCheckoutOpen } = useCart();
  const [format, setFormat] = useState<ProductFormat>('single');
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'coa' | 'handling'>('details');

  if (!product) return null;

  const isKit = format === 'kit';
  const unitPriceGbp = isKit && product.kit_price_gbp ? product.kit_price_gbp : product.price_gbp;
  const unitPriceEur = isKit && product.kit_price_eur ? product.kit_price_eur : product.price_eur;

  const handleAdd = () => {
    addItem(product, quantity, format);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const increment = () => {
    if (quantity < Math.min(product.max_per_order, product.stock_quantity)) {
      setQuantity((q) => q + 1);
    }
  };

  const decrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  // Direct quick WhatsApp inquiry for this specific peptide
  const handleDirectWhatsApp = () => {
    const phone = getWhatsAppNumber();
    const currSym = currency === 'EUR' ? '€' : '£';
    const unitPrice = currency === 'EUR' ? unitPriceEur : unitPriceGbp;
    const total = (unitPrice * quantity).toFixed(2);
    const formatLabel = isKit ? '10-Vial Research Kit Box' : 'Single Lyophilized Vial';

    const msg = `*AZ LABS — PEPTIDE INQUIRY*
Product: *${product.name}* (${product.sku})
Format: ${formatLabel}
Quantity: ${quantity} vial(s)/box(es)
Price: ${currSym}${unitPrice.toFixed(2)} each (Est. Total: ${currSym}${total})
CoA Batch: ${product.coa_batch || 'Latest batch'}
------------------------------
Hello AZ Labs, I would like to confirm availability and order this peptide for in-vitro laboratory research.`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-zinc-950 border border-zinc-800 text-zinc-100 p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 border-b border-zinc-900 bg-zinc-950/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                {product.sku}
              </span>
              {product.cas_number && (
                <span className="font-mono text-xs text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  CAS {product.cas_number}
                </span>
              )}
            </div>
            <Badge
              variant="outline"
              className={
                product.in_stock
                  ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'
                  : 'border-amber-500/40 text-amber-400 bg-amber-950/30'
              }
            >
              {product.in_stock ? 'In Stock • Fast UK & EU Dispatch' : 'Batch Reserve'}
            </Badge>
          </div>
          <DialogTitle className="text-xl md:text-2xl font-bold text-white mt-2">
            {product.name}
          </DialogTitle>
          <p className="text-xs text-zinc-400 font-sans">{product.grade}</p>
        </DialogHeader>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-zinc-900 px-6 bg-zinc-950/40 text-xs font-mono">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'details'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('coa')}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'coa'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            HPLC & 3rd Party CoA
          </button>
          <button
            onClick={() => setActiveTab('handling')}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'handling'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Reconstitution & Storage
          </button>
        </div>

        <div className="p-6 max-h-[68vh] overflow-y-auto space-y-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <ProductImage
                  src={product.image_url}
                  alt={product.alt_text}
                  category={product.category}
                  capColor={product.cap_color}
                  sku={product.sku}
                  aspectRatio="square"
                />
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span>Unit: {product.unit_size}</span>
                  {product.coa_batch && <span>Lot: {product.coa_batch}</span>}
                </div>

                {/* Sequence Card */}
                {product.sequence && (
                  <div className="mt-4 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono space-y-1">
                    <div className="text-zinc-500 uppercase flex items-center gap-1 text-[10px]">
                      <Dna className="h-3 w-3 text-emerald-400" />
                      Peptide Sequence:
                    </div>
                    <div className="text-zinc-200 break-words leading-relaxed select-all">
                      {product.sequence}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-mono mb-1">
                    Scientific Description
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Format Switcher (Single Vial vs 10-Vial Kit Box) */}
                {product.kit_price_gbp && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase text-zinc-400">
                      Select Research Presentation:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormat('single')}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          format === 'single'
                            ? 'bg-zinc-900 border-emerald-500/80 text-white shadow-sm'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="text-xs font-bold font-mono text-zinc-100">Single Vial</div>
                        <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                          {formatPrice(product.price_gbp, product.price_eur)}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormat('kit')}
                        className={`p-2.5 rounded-lg border text-left transition-all relative ${
                          format === 'kit'
                            ? 'bg-zinc-900 border-emerald-500/80 text-white shadow-sm'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded bg-emerald-500 text-black text-[9px] font-mono font-bold">
                          SAVE 20%
                        </span>
                        <div className="text-xs font-bold font-mono text-zinc-100">10-Vial Kit Box</div>
                        <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                          {formatPrice(product.kit_price_gbp, product.kit_price_eur || 0)}
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Pricing & Add to Cart Container */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-mono text-zinc-400">
                      {isKit ? '10-Vial Kit Price' : 'Single Vial Price'}
                    </span>
                    <div className="text-2xl font-bold font-mono text-white">
                      {formatPrice(unitPriceGbp, unitPriceEur)}
                      <span className="text-xs font-sans text-zinc-400 ml-1">ex. VAT</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-900">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-zinc-300 hover:text-white hover:bg-zinc-800"
                        onClick={decrement}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-10 text-center font-mono text-sm font-semibold">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-zinc-300 hover:text-white hover:bg-zinc-800"
                        onClick={increment}
                        disabled={quantity >= Math.min(product.max_per_order, product.stock_quantity)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      onClick={handleAdd}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)] gap-2 text-xs"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {addedNotice ? 'Added to Cart ✓' : isKit ? 'Add Kit Box to Cart' : 'Add Vial to Cart'}
                    </Button>
                  </div>

                  {/* Quick Direct WhatsApp Order */}
                  <Button
                    variant="outline"
                    onClick={handleDirectWhatsApp}
                    className="w-full border-zinc-700 hover:bg-emerald-950/40 hover:border-emerald-500/50 text-emerald-400 text-xs font-mono gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Inquire / Order Directly via WhatsApp</span>
                  </Button>
                </div>

                {/* Authorized Destinations */}
                <div className="text-xs text-zinc-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-medium text-zinc-300">
                    <Globe2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Authorized Delivery Territories:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {product.lawful_destinations.map((code) => {
                      const country = ELIGIBLE_COUNTRIES.find((c) => c.code === code);
                      return (
                        <span
                          key={code}
                          className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 font-mono"
                        >
                          {country ? `${country.flag} ${country.code}` : code}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HPLC & CERTIFICATE OF ANALYSIS */}
          {activeTab === 'coa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-zinc-400 uppercase">Certificate of Analysis (CoA)</div>
                  <div className="text-lg font-mono font-bold text-emerald-400">Lot #{product.coa_batch || 'AZ-2026-QC'}</div>
                  <div className="text-[11px] text-zinc-400">Tested: {product.coa_date || 'October 2026'} • Method: Reverse Phase HPLC / ESI-MS</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-zinc-400">Verified Purity</div>
                  <div className="text-2xl font-mono font-bold text-white">{product.purity || '>99.2%'}</div>
                  <div className="text-[10px] text-emerald-400 font-mono">STATUS: PASS</div>
                </div>
              </div>

              {/* Simulated Chromatogram Representation */}
              <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-zinc-900 pb-2">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Analytical HPLC Chromatogram Scan
                  </span>
                  <span>Wavelength: 214 nm</span>
                </div>
                {/* SVG Chromatogram Curve */}
                <div className="h-32 w-full flex items-end relative pt-4">
                  <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                    <path
                      d="M 0,110 L 120,110 L 180,108 L 220,105 L 245,15 L 255,15 L 280,105 L 320,108 L 500,110"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M 220,105 L 245,15 L 255,15 L 280,105 Z"
                      fill="rgba(16, 185, 129, 0.15)"
                    />
                    {/* Retention Time Marker */}
                    <line x1="250" y1="15" x2="250" y2="110" stroke="#34d399" strokeDasharray="2 2" strokeWidth="1" />
                    <text x="255" y="30" fill="#34d399" fontSize="10" fontFamily="monospace">
                      Peak RT: 12.45 min (99.4%)
                    </text>
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 pt-1">
                  <span>0.00 min</span>
                  <span>5.00 min</span>
                  <span>10.00 min</span>
                  <span>15.00 min</span>
                  <span>20.00 min</span>
                </div>
              </div>

              {/* Specifications Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800 flex items-center justify-between"
                  >
                    <span className="text-zinc-400">{key}:</span>
                    <span className="font-mono text-zinc-200 font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RECONSTITUTION & STORAGE GUIDELINES */}
          {activeTab === 'handling' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <h4 className="font-bold text-white font-mono text-sm">Laboratory Reconstitution Protocol</h4>
                <p className="text-zinc-300 leading-relaxed">
                  1. Allow the lyophilized vial to equilibrate to room temperature (15-25 °C) for at least 20 minutes before piercing the septum to prevent ambient moisture condensation.
                </p>
                <p className="text-zinc-300 leading-relaxed">
                  2. Aseptically inject recommended sterile Bacteriostatic Water (0.9% Benzyl Alcohol) or Deionized Water down the inner glass wall of the vial.
                </p>
                <p className="text-zinc-300 leading-relaxed">
                  3. Swirl gently in circular motions until the lyophilized solid is fully dissolved. <strong className="text-emerald-400">Do not vortex aggressively</strong> to avoid shearing delicate peptide sequences.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <h4 className="font-bold text-white font-mono text-sm">Temperature & Storage Parameters</h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-400 block text-[10px]">Lyophilized Solid:</span>
                    <span className="text-white font-semibold">-20 °C (Up to 24 Months)</span>
                  </div>
                  <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-400 block text-[10px]">Reconstituted Solution:</span>
                    <span className="text-white font-semibold">2 - 8 °C (Up to 30 Days)</span>
                  </div>
                </div>
              </div>

              {product.safety_notes && (
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200 flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-amber-300 mb-0.5 font-mono">
                      In-Vitro Research Restriction
                    </div>
                    <div className="text-amber-200/90 leading-relaxed font-sans">
                      {product.safety_notes}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
