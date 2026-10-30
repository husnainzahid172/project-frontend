'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/lib/currency-context';
import { ELIGIBLE_COUNTRIES } from '@/lib/products-data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle,
  ExternalLink,
  MessageCircle,
  Globe,
  FileCheck,
  Dna,
} from 'lucide-react';
import { OrderCreateSuccessResponse } from '@/types/order';

export function CheckoutDialog() {
  const {
    items,
    isCheckoutOpen,
    setIsCheckoutOpen,
    subtotalGbp,
    subtotalEur,
    clearCart,
  } = useCart();
  const { currency, formatPrice } = useCurrency();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [countryCode, setCountryCode] = useState('GB');
  const [notes, setNotes] = useState('');
  const [complianceConfirmed, setComplianceConfirmed] = useState(false);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<OrderCreateSuccessResponse | null>(null);

  const selectedCountry =
    ELIGIBLE_COUNTRIES.find((c) => c.code === countryCode) || ELIGIBLE_COUNTRIES[0];

  const currentSubtotal = currency === 'EUR' ? subtotalEur : subtotalGbp;
  const shippingCost =
    currency === 'EUR' ? selectedCountry.shippingEur : selectedCountry.shippingGbp;
  const vatRate = selectedCountry.vatRate;
  const vatAmount = Number((currentSubtotal * vatRate).toFixed(2));
  const estimatedTotal = Number((currentSubtotal + shippingCost + vatAmount).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!complianceConfirmed) {
      setErrorMessage(
        'You must confirm that you are at least 21 years old and that all ordered peptides are strictly for in-vitro laboratory research.'
      );
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
          addressLine2,
          city,
          postalCode,
          countryCode,
          notes,
          complianceConfirmed,
        },
        items: items.map((it) => ({
          productId: it.product.id,
          format: it.format,
          quantity: it.quantity,
        })),
        currency,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(
          data.error || 'Server error occurred during order validation. Please review your details and retry.'
        );
        setIsSubmitting(false);
        return;
      }

      // Success!
      setSuccessData(data);
      clearCart();

      // Automatically take the customer directly to WhatsApp with pre-filled message!
      if (data.whatsappUrl) {
        // Attempt open window
        const win = window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          // If popup blocked, direct redirect
          window.location.href = data.whatsappUrl;
        }
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Network connection failed. Please check your internet connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (successData?.whatsappUrl) {
      window.open(successData.whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    if (successData) {
      setTimeout(() => {
        setSuccessData(null);
        setErrorMessage(null);
      }, 300);
    }
  };

  return (
    <Dialog open={isCheckoutOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 border-b border-zinc-900 bg-zinc-950/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <DialogTitle className="text-xl font-bold text-white font-sans">
              {successData ? 'Order Created & Connecting to WhatsApp' : 'Complete Peptide Order & Connect to WhatsApp'}
            </DialogTitle>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {successData
              ? 'Your peptide order has been verified on azlabs.pro and sent to our WhatsApp desk (+44 7448 399290).'
              : 'Server-side validated order creation with automatic WhatsApp order dispatch.'}
          </p>
        </DialogHeader>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {successData ? (
            /* Success & WhatsApp Forwarding View */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                <CheckCircle className="h-8 w-8" />
              </div>

              <div>
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                  Unique Order Reference
                </span>
                <div className="text-3xl font-mono font-bold text-emerald-400 mt-1 select-all">
                  {successData.order.reference}
                </div>
                <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto">
                  Registered in AZ Labs PostgreSQL order system. Redirecting directly to our UK WhatsApp desk at{' '}
                  <strong className="text-emerald-400 font-mono">+44 7448 399290</strong> with your pre-filled order specifications.
                </p>
              </div>

              {/* Order Breakdown Snapshot */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-left space-y-2 text-xs">
                <div className="flex justify-between font-mono text-zinc-400 pb-2 border-b border-zinc-800">
                  <span>Researcher: {successData.order.customer_name}</span>
                  <span>Items: {successData.order.items.length}</span>
                </div>
                <div className="space-y-1.5 py-1">
                  {successData.order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-zinc-300">
                      <span>
                        {it.name} (x{it.quantity})
                      </span>
                      <span className="font-mono text-white">
                        {currency === 'EUR' ? '€' : '£'}
                        {it.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between font-bold text-sm text-white">
                  <span>Validated Total (inc. Cold-Chain & VAT):</span>
                  <span className="font-mono text-emerald-400">
                    {currency === 'EUR' ? '€' : '£'}
                    {successData.order.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Direct WhatsApp Callout Button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleOpenWhatsApp}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-6 shadow-[0_0_20px_rgba(16,185,129,0.35)] gap-2 text-sm"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Open WhatsApp Order (+44 7448 399290)</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="border-zinc-800 hover:bg-zinc-900 text-zinc-300 text-sm py-6"
                >
                  Return to Catalogue
                </Button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-200 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold font-mono text-red-300 mb-0.5">
                      Order Validation Alert
                    </div>
                    <div>{errorMessage}</div>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <FileCheck className="h-3.5 w-3.5" />
                  1. Researcher & Laboratory Contact
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">
                      Full Name / Researcher <span className="text-emerald-400">*</span>
                    </Label>
                    <Input
                      required
                      placeholder="e.g. Dr. Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">
                      Email Address <span className="text-emerald-400">*</span>
                    </Label>
                    <Input
                      required
                      type="email"
                      placeholder="a.morgan@research-lab.co.uk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">
                      WhatsApp / Phone Number <span className="text-emerald-400">*</span>
                    </Label>
                    <Input
                      required
                      placeholder="+44 7448 000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">
                      Institution / Facility / Company (Optional)
                    </Label>
                    <Input
                      placeholder="e.g. BioResearch Labs UK"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address & Destination */}
              <div className="space-y-4 pt-2 border-t border-zinc-900">
                <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  2. Authorized Delivery Destination (UK & EU)
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-300">
                    Destination Country <span className="text-emerald-400">*</span>
                  </Label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full h-9 bg-zinc-900 border border-zinc-800 rounded-md px-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
                  >
                    {ELIGIBLE_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} ({c.code}) — Express Cold-Chain: {currency === 'EUR' ? `€${c.shippingEur.toFixed(2)}` : `£${c.shippingGbp.toFixed(2)}`} | VAT: {(c.vatRate * 100).toFixed(0)}%
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-300">
                    Street Address & Lab Room <span className="text-emerald-400">*</span>
                  </Label>
                  <Input
                    required
                    placeholder="e.g. 24 Science Park Blvd, Suite 3B"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-zinc-100 h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">
                      City <span className="text-emerald-400">*</span>
                    </Label>
                    <Input
                      required
                      placeholder="e.g. London / Manchester / Berlin / Paris"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">
                      Postal Code / Postcode <span className="text-emerald-400">*</span>
                    </Label>
                    <Input
                      required
                      placeholder="e.g. EC1A 1BB / 10115"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-300">Special Handling / Cold-Chain Notes (Optional)</Label>
                  <Input
                    placeholder="e.g. Include printed batch CoA, delivery to reception desk"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-zinc-100 h-9 text-xs"
                  />
                </div>
              </div>

              {/* Order Financial Summary */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Peptide Products Subtotal:</span>
                  <span className="font-mono text-zinc-200 font-semibold">
                    {formatPrice(subtotalGbp, subtotalEur)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>
                    Tracked Cold-Chain Dispatch ({selectedCountry.flag} {selectedCountry.name}):
                  </span>
                  <span className="font-mono text-zinc-200">
                    {currency === 'EUR' ? '€' : '£'}
                    {shippingCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>
                    VAT ({selectedCountry.code} {(vatRate * 100).toFixed(0)}%):
                  </span>
                  <span className="font-mono text-zinc-200">
                    {currency === 'EUR' ? '€' : '£'}
                    {vatAmount.toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between font-bold text-sm text-white">
                  <span>Total Calculated:</span>
                  <span className="font-mono text-emerald-400">
                    {currency === 'EUR' ? '€' : '£'}
                    {estimatedTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* In-Vitro Research Compliance Declaration (Inspired by Vitralab Research) */}
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/50 space-y-2">
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="compliance"
                    checked={complianceConfirmed}
                    onCheckedChange={(checked) => setComplianceConfirmed(Boolean(checked))}
                    className="mt-0.5 border-emerald-600 data-[state=checked]:bg-emerald-600"
                  />
                  <label
                    htmlFor="compliance"
                    className="text-xs text-zinc-300 leading-snug cursor-pointer select-none"
                  >
                    <span className="font-semibold text-emerald-400">
                      Age Verification (21+) & In-Vitro Research Acknowledgement:{' '}
                    </span>
                    I certify that I am at least 21 years of age and that all ordered peptides will be used strictly for in-vitro laboratory research, analytical testing, or scientific experimentation. These products are explicitly NOT for human or animal consumption, diagnostic use, clinical administration, cosmetic, or therapeutic applications.
                  </label>
                </div>
              </div>

              {/* Submit & WhatsApp Integration Button */}
              <Button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-6 shadow-[0_0_20px_rgba(16,185,129,0.35)] gap-2 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Validating & Connecting to WhatsApp...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-5 w-5" />
                    <span>Place Order & Open WhatsApp (+44 7448 399290)</span>
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
