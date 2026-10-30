'use client';

import React, { useState } from 'react';
import { Product } from '@/types/product';
import { ProductFormat } from '@/types/order';
import { ELIGIBLE_COUNTRIES } from '@/lib/products-data';
import { useCurrency } from '@/lib/currency-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  MessageCircle,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Dna,
} from 'lucide-react';

interface QuickOrderSectionProps {
  products: Product[];
}

export function QuickOrderSection({ products }: QuickOrderSectionProps) {
  const { currency, formatPrice } = useCurrency();

  // Selected Peptide & Format
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [format, setFormat] = useState<ProductFormat>('single');
  const [quantity, setQuantity] = useState(1);

  // Customer Contact
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('GB');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [institution, setInstitution] = useState('');
  const [complianceConfirmed, setComplianceConfirmed] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  const selectedProduct =
    products.find((p) => p.id === selectedProductId) || products[0];

  const selectedCountry =
    ELIGIBLE_COUNTRIES.find((c) => c.code === countryCode) || ELIGIBLE_COUNTRIES[0];

  const isKit = format === 'kit';
  const unitPriceGbp =
    isKit && selectedProduct?.kit_price_gbp
      ? selectedProduct.kit_price_gbp
      : selectedProduct?.price_gbp || 0;
  const unitPriceEur =
    isKit && selectedProduct?.kit_price_eur
      ? selectedProduct.kit_price_eur
      : selectedProduct?.price_eur || 0;

  const currentUnitPrice = currency === 'EUR' ? unitPriceEur : unitPriceGbp;
  const lineSubtotal = Number((currentUnitPrice * quantity).toFixed(2));
  const shippingCost =
    currency === 'EUR' ? selectedCountry.shippingEur : selectedCountry.shippingGbp;
  const vatAmount = Number((lineSubtotal * selectedCountry.vatRate).toFixed(2));
  const totalAmount = Number((lineSubtotal + shippingCost + vatAmount).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!complianceConfirmed) {
      setErrorMessage(
        'Please confirm that you are 21+ and ordering strictly for in-vitro research use.'
      );
      return;
    }

    if (!selectedProduct) {
      setErrorMessage('Please select a peptide.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer: {
          name,
          email,
          phone,
          institution,
          addressLine1,
          city,
          postalCode,
          countryCode,
          complianceConfirmed,
        },
        items: [
          {
            productId: selectedProduct.id,
            format,
            quantity,
          },
        ],
        currency,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to place order. Please check inputs.');
        setIsSubmitting(false);
        return;
      }

      setSuccessOrder(data);

      // Automatically launch WhatsApp!
      if (data.whatsappUrl) {
        const win = window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          window.location.href = data.whatsappUrl;
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network connection failed. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="quick-order" className="py-20 border-b border-zinc-900 bg-zinc-950/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/60 text-emerald-400 text-xs font-mono mb-3">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>Instant WhatsApp Integration</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Direct Peptide Order Builder
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Configure your peptide sequence, pick Single Vial or 10-Vial Research Kit, and place your order directly through our secure backend to WhatsApp (+44 7448 399290).
          </p>
        </div>

        {successOrder ? (
          <div className="p-8 rounded-2xl bg-zinc-900/60 border border-emerald-500/40 text-center space-y-6 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                Order Logged & WhatsApp Activated
              </span>
              <div className="text-3xl font-mono font-bold text-emerald-400 mt-1">
                {successOrder.order.reference}
              </div>
              <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto">
                Your order is recorded in the AZ Labs registry. Click the button below if WhatsApp did not open automatically.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                onClick={() => window.open(successOrder.whatsappUrl, '_blank')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-6 px-8 text-sm gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Open WhatsApp (+44 7448 399290)</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setSuccessOrder(null)}
                className="border-zinc-800 hover:bg-zinc-800 text-zinc-300 py-6"
              >
                Build Another Order
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-8"
          >
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-xs text-red-200">
                {errorMessage}
              </div>
            )}

            {/* Step 1: Select Peptide & Format */}
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Dna className="h-3.5 w-3.5" />
                Step 1: Choose Research Peptide Sequence & Presentation
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-7 space-y-1.5">
                  <Label className="text-xs text-zinc-300">Peptide Product</Label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full h-11 bg-zinc-950 border border-zinc-800 rounded-lg px-3 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — {p.unit_size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-5 space-y-1.5">
                  <Label className="text-xs text-zinc-300">Presentation / Packaging</Label>
                  <div className="grid grid-cols-2 gap-2 h-11">
                    <button
                      type="button"
                      onClick={() => setFormat('single')}
                      className={`rounded-lg border text-xs font-mono font-medium transition-all ${
                        format === 'single'
                          ? 'bg-zinc-800 border-zinc-600 text-white'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Single Vial
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormat('kit')}
                      className={`rounded-lg border text-xs font-mono font-medium transition-all relative ${
                        format === 'kit'
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      10-Vial Kit Box
                      <span className="text-[9px] block text-emerald-200">Save 20%</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quantity Stepper & Price preview */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Label className="text-xs text-zinc-400">Order Quantity:</Label>
                  <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="h-8 w-8 text-zinc-400 hover:text-white text-xs"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-mono text-xs font-semibold text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="h-8 w-8 text-zinc-400 hover:text-white text-xs"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {isKit ? 'kit box(es)' : 'vial(s)'}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-xs text-zinc-400">Unit Price:</div>
                  <div className="text-lg font-mono font-bold text-white">
                    {formatPrice(unitPriceGbp, unitPriceEur)}{' '}
                    <span className="text-xs text-zinc-500">each</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Customer Contact & Delivery Info */}
            <div className="space-y-4 pt-4 border-t border-zinc-850">
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Step 2: Delivery & Contact Coordinates
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-zinc-300">Full Name *</Label>
                  <Input
                    required
                    placeholder="e.g. Dr. Jordan Lee"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-zinc-300">Email Address *</Label>
                  <Input
                    required
                    type="email"
                    placeholder="j.lee@institution.co.uk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-zinc-300">WhatsApp / Phone *</Label>
                  <Input
                    required
                    placeholder="+44 7448 000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-xs h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-zinc-300">Country *</Label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-md px-2.5 text-xs font-mono text-zinc-200"
                  >
                    {ELIGIBLE_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs text-zinc-300">Street Address *</Label>
                  <Input
                    required
                    placeholder="e.g. 15 Innovation Way, Lab 2"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-zinc-300">City & Postcode *</Label>
                  <Input
                    required
                    placeholder="London, EC1A 1BB"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* Financial Summary & Total */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal ({quantity} {isKit ? 'kit(s)' : 'vial(s)'}):</span>
                <span className="text-zinc-200">{currency === 'EUR' ? '€' : '£'}{lineSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Cold-Chain Express Dispatch ({selectedCountry.name}):</span>
                <span className="text-zinc-200">{currency === 'EUR' ? '€' : '£'}{shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>VAT ({(selectedCountry.vatRate * 100).toFixed(0)}%):</span>
                <span className="text-zinc-200">{currency === 'EUR' ? '€' : '£'}{vatAmount.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-zinc-850 flex justify-between font-bold text-sm text-white">
                <span>Total Validated:</span>
                <span className="text-emerald-400">{currency === 'EUR' ? '€' : '£'}{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Compliance Acknowledgment */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
              <Checkbox
                id="quick-compliance"
                checked={complianceConfirmed}
                onCheckedChange={(c) => setComplianceConfirmed(Boolean(c))}
                className="mt-0.5 border-emerald-600 data-[state=checked]:bg-emerald-600"
              />
              <label
                htmlFor="quick-compliance"
                className="text-[11px] text-zinc-300 leading-snug cursor-pointer select-none"
              >
                I confirm I am 21+ years of age and that all ordered peptides are strictly for in-vitro laboratory research and not for human or veterinary use.
              </label>
            </div>

            {/* Big WhatsApp Dispatch Action */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-6 shadow-[0_0_25px_rgba(16,185,129,0.35)] gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connecting to WhatsApp...</span>
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5" />
                  <span>Place Order & Open WhatsApp (+44 7448 399290)</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
