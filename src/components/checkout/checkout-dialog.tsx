'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/lib/currency-context';
import { SHIPPING_COUNTRIES } from '@/lib/products-data';
import { buildQuote, formatMoney } from '@/lib/pricing';
import { customerSchema } from '@/lib/validation';
import type { OrderCreateResponse } from '@/types/order';
import { useStore } from '@/lib/store-context';
import { buildOrderMessage, buildOrderWhatsappUrl } from '@/lib/whatsapp';
import { whatsappLink } from '@/lib/site-config';

type Form = {
  name: string; email: string; phone: string; institution: string;
  addressLine1: string; addressLine2: string; city: string; postalCode: string;
  countryCode: string; notes: string; termsAccepted: boolean;
};

const EMPTY: Form = { name: '', email: '', phone: '', institution: '', addressLine1: '', addressLine2: '', city: '', postalCode: '', countryCode: 'GB', notes: '', termsAccepted: false };

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-zinc-300">{label}</label>
      {children}
      {error && <p id={`${id}-err`} className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  );
}

export function CheckoutDialog() {
  const { lines, products, isCheckoutOpen, setIsCheckoutOpen, clearCart } = useCart();
  const { currency } = useCurrency();
  const { preview } = useStore();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState<Extract<OrderCreateResponse, { success: true }> | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState('');

  // New key each time the dialog opens; reused across retries so double-submits can't create two orders.
  useEffect(() => { if (isCheckoutOpen) { setIdempotencyKey(crypto.randomUUID()); setServerError(null); } }, [isCheckoutOpen]);

  const items = lines.map((l) => ({ productId: l.productId, format: l.format, quantity: l.quantity, variationId: l.variationId }));
  const quote = useMemo(() => buildQuote(products, items, currency, form.countryCode), [products, JSON.stringify(items), currency, form.countryCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => {
      if (!(k in e)) return e;
      const next = { ...e };
      delete next[k as string];
      return next;
    });
  };
  const inputProps = (k: keyof Form) => ({
    id: `co-${k}`,
    value: form[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(k, e.target.value as never),
    'aria-invalid': Boolean(errors[k]) || undefined,
    'aria-describedby': errors[k] ? `co-${k}-err` : undefined,
    className: 'field',
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    const parsed = customerSchema.safeParse(form);
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v?.[0] ?? 'Invalid'])));
      return;
    }
    setErrors({});
    if (!quote.ok) { setServerError(quote.error); return; }

    if (preview) {
      // Private preview: same quote and message as a real order, but nothing is sent to the server.
      const reference = `TEST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const msg = buildOrderMessage({
        reference,
        customer: { ...parsed.data, institution: parsed.data.institution || undefined },
        quote: quote.quote,
      });
      setDone({ success: true, reference, quote: quote.quote, whatsappUrl: whatsappLink(`TEST ORDER (website preview, not a real order)\n\n${msg}`) });
      clearCart();
      return;
    }

    setSubmitting(true);
    let orderResult: Extract<OrderCreateResponse, { success: true }> | null = null;
    const clientRef = `AZ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idempotencyKey, currency, customer: parsed.data, items }),
      });
      const data: OrderCreateResponse = await res.json();
      if (data && data.success) {
        orderResult = data;
      }
    } catch {
      // Background logging or Supabase offline; fallback to direct WhatsApp order
    }

    if (!orderResult) {
      const whatsappUrl = buildOrderWhatsappUrl({
        reference: clientRef,
        customer: {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          addressLine1: parsed.data.addressLine1,
          city: parsed.data.city,
          postalCode: parsed.data.postalCode,
          countryCode: parsed.data.countryCode,
          institution: parsed.data.institution || undefined,
          notes: parsed.data.notes || undefined,
        },
        quote: quote.quote,
      });
      orderResult = {
        success: true,
        reference: clientRef,
        quote: quote.quote,
        whatsappUrl,
      };
    }

    setDone(orderResult);
    clearCart();
    setSubmitting(false);

    // Open WhatsApp automatically so the customer does not close the tab without sending the order
    if (orderResult.whatsappUrl) {
      const redirectUrl = orderResult.whatsappUrl;
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 300);
    }
  }

  function close(open: boolean) {
    setIsCheckoutOpen(open);
    if (!open && done) { setDone(null); setForm(EMPTY); }
  }

  return (
    <Dialog open={isCheckoutOpen} onOpenChange={close}>
      <DialogContent className="max-h-[94vh] max-w-3xl overflow-y-auto border-white/10 bg-card p-0 sm:rounded-2xl">
        {done ? (
          <div className="p-8 text-center sm:p-12">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
            <DialogTitle className="mt-5 font-display text-2xl font-semibold text-zinc-50">{preview ? 'Test order created' : 'Order received'}</DialogTitle>
            <DialogDescription className="mx-auto mt-2 max-w-md text-sm text-zinc-300">
              Your reference is <span className="font-mono text-zinc-100">{done.reference}</span>.{' '}
              {preview
                ? 'Nothing was saved. Open WhatsApp to see exactly what a customer would send.'
                : 'We will confirm availability and payment details with you. You can also send the summary to us on WhatsApp now.'}
            </DialogDescription>
            <div className="mx-auto mt-6 max-w-sm rounded-xl border border-white/10 p-4 text-left text-sm">
              {done.quote.lines.map((l) => (
                <div key={l.productId + l.format} className="flex justify-between py-1 text-zinc-200"><span>{l.name} × {l.quantity}</span><span className="tabular-nums">{formatMoney(l.lineTotal, done.quote.currency)}</span></div>
              ))}
              <div className="mt-2 flex justify-between border-t border-white/10 pt-2 font-medium text-zinc-50"><span>Total</span><span className="tabular-nums">{formatMoney(done.quote.total, done.quote.currency)}</span></div>
            </div>
            <a href={done.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-accent mt-6">
              <MessageCircle className="h-4 w-4" /> Send summary on WhatsApp
            </a>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="grid md:grid-cols-[1.3fr_1fr]">
            <div className="space-y-4 p-6 sm:p-8">
              <DialogTitle className="font-display text-xl font-semibold text-zinc-50">Checkout</DialogTitle>
              <DialogDescription className="text-sm text-zinc-400">Delivery details</DialogDescription>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="co-name" label="Full name" error={errors.name}><input autoComplete="name" {...inputProps('name')} /></Field>
                <Field id="co-institution" label="Organisation (optional)" error={errors.institution}><input autoComplete="organization" {...inputProps('institution')} /></Field>
                <Field id="co-email" label="Email" error={errors.email}><input type="email" autoComplete="email" {...inputProps('email')} /></Field>
                <Field id="co-phone" label="Phone (with country code)" error={errors.phone}><input type="tel" autoComplete="tel" {...inputProps('phone')} /></Field>
              </div>
              <Field id="co-addressLine1" label="Address" error={errors.addressLine1}><input autoComplete="address-line1" {...inputProps('addressLine1')} /></Field>
              <Field id="co-addressLine2" label="Address line 2 (optional)" error={errors.addressLine2}><input autoComplete="address-line2" {...inputProps('addressLine2')} /></Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field id="co-city" label="Town / city" error={errors.city}><input autoComplete="address-level2" {...inputProps('city')} /></Field>
                <Field id="co-postalCode" label="Postcode" error={errors.postalCode}><input autoComplete="postal-code" {...inputProps('postalCode')} /></Field>
                <Field id="co-countryCode" label="Country" error={errors.countryCode}>
                  <select autoComplete="country" {...inputProps('countryCode')}>
                    {SHIPPING_COUNTRIES.map((c) => <option key={c.code} value={c.code} >{c.name}</option>)}
                  </select>
                </Field>
              </div>
              <Field id="co-notes" label="Notes (optional)" error={errors.notes}><textarea rows={2} {...inputProps('notes')} className="field h-auto py-2.5" /></Field>
              <label className="flex items-start gap-2.5 text-sm text-zinc-300">
                <input type="checkbox" checked={form.termsAccepted} onChange={(e) => set('termsAccepted', e.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-500" aria-invalid={Boolean(errors.termsAccepted) || undefined} />
                <span>I confirm these details are correct and accept the terms of sale.</span>
              </label>
              {errors.termsAccepted && <p className="-mt-2 text-xs text-red-300">{errors.termsAccepted}</p>}
            </div>

            <aside className="flex flex-col border-t border-white/10 bg-white/[0.03] p-6 sm:p-8 md:border-l md:border-t-0">
              <p className="text-sm font-medium text-zinc-100">Order summary</p>
              {quote.ok ? (
                <dl className="mt-4 space-y-2 text-sm">
                  {quote.quote.lines.map((l) => (
                    <div key={l.productId + l.format} className="flex justify-between gap-3 text-zinc-300"><dt>{l.name} × {l.quantity}</dt><dd className="tabular-nums text-zinc-100">{formatMoney(l.lineTotal, currency)}</dd></div>
                  ))}
                  <div className="flex justify-between border-t border-white/10 pt-3 text-zinc-300"><dt>Subtotal</dt><dd className="tabular-nums">{formatMoney(quote.quote.subtotal, currency)}</dd></div>
                  <div className="flex justify-between text-zinc-300"><dt>Shipping</dt><dd className="tabular-nums">{formatMoney(quote.quote.shipping, currency)}</dd></div>
                  <div className="flex justify-between border-t border-white/10 pt-3 text-base font-medium text-zinc-50"><dt>Total</dt><dd className="tabular-nums">{formatMoney(quote.quote.total, currency)}</dd></div>
                </dl>
              ) : (
                <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-300">{quote.error}</p>
              )}
              {serverError && <p role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{serverError}</p>}
              <button type="submit" disabled={submitting || !quote.ok || lines.length === 0} className="btn-accent mt-auto w-full py-3">
                {submitting ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Preparing WhatsApp Order...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><MessageCircle className="h-4 w-4" /> Send Order on WhatsApp</span>
                )}
              </button>
              <p className="mt-3 text-center text-xs text-zinc-400">
                Your order details will open in WhatsApp with our desk to confirm payment and dispatch.
              </p>
            </aside>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
