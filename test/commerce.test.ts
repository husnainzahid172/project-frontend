import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPurchase, isPubliclyListed, validateStatusChange } from '@/lib/eligibility';
import { buildQuote, unitPrice, formatMoney } from '@/lib/pricing';
import { buildOrderMessage } from '@/lib/whatsapp';
import { customerSchema, orderRequestSchema } from '@/lib/validation';
import { INITIAL_PRODUCTS } from '@/lib/products-data';
import { whatsappLink } from '@/lib/site-config';
import type { Product } from '@/types/product';

const selank = INITIAL_PRODUCTS.find((p) => p.sku === 'AZ-SEL-10')!;
const reta = INITIAL_PRODUCTS.find((p) => p.sku === 'AZ-RETA-10')!;
const tirz = INITIAL_PRODUCTS.find((p) => p.sku === 'AZ-TIRZ-10')!;
const forSale: Product = {
  ...selank, id: 'p1', eligibility_status: 'approved_sale', eligibility_doc_ref: 'Letter ABC/1',
  lawful_destinations: ['GB'], price_gbp: 45, price_eur: 52, kit_price_gbp: 360, kit_price_eur: 415, in_stock: true, stock_quantity: 100,
};

test('catalogue has the eight products, none public or orderable by default', () => {
  assert.equal(INITIAL_PRODUCTS.length, 8);
  assert.deepEqual(
    INITIAL_PRODUCTS.map((p) => p.sku).sort(),
    ['AZ-GLOW', 'AZ-NAD-500', 'AZ-RETA-10', 'AZ-SEL-10', 'AZ-SMX-50', 'AZ-SNAD-1000', 'AZ-SNAD-500', 'AZ-TIRZ-10']
  );
  for (const p of INITIAL_PRODUCTS) {
    assert.equal(isPubliclyListed(p), false, p.sku);
    assert.equal(checkPurchase(p).allowed, false, p.sku);
    assert.deepEqual(p.lawful_destinations, [], p.sku);
    assert.equal(p.price_gbp, 0, `${p.sku}: no invented prices`);
    assert.ok(p.image_paths.length >= 1, `${p.sku}: has images`);
  }
});

test('retatrutide and tirzepatide are locked', () => {
  for (const p of [reta, tirz]) {
    assert.equal(p.is_restricted, true);
    assert.equal(p.eligibility_status, 'not_approved');
    const attempt = { ...p, eligibility_status: 'approved_sale' as const, eligibility_doc_ref: 'x', lawful_destinations: ['GB'], price_gbp: 1, price_eur: 1 };
    assert.match(validateStatusChange(attempt) ?? '', /restricted/);
    assert.equal(isPubliclyListed({ ...attempt }), false);
    assert.equal(checkPurchase(attempt).allowed, false);
  }
});

test('no medicinal claims or invented test data in catalogue copy', () => {
  const copy = INITIAL_PRODUCTS.map((p) => [p.name, p.description, JSON.stringify(p.specifications)].join(' ')).join(' ').toLowerCase();
  for (const banned of ['anxiolytic', 'wellbeing', 'weight', 'regeneration', 'cognitive', 'nootropic', 'energy', 'aging', 'purity', 'hplc', 'glp-1', 'agonist', 'clinically']) {
    assert.ok(!copy.includes(banned), `found "${banned}"`);
  }
});

test('status rules', () => {
  const base = { ...selank, price_gbp: 10, price_eur: 12 };
  assert.match(validateStatusChange({ ...base, eligibility_status: 'approved_marketing' }) ?? '', /documentation/);
  assert.equal(validateStatusChange({ ...base, eligibility_status: 'approved_marketing', eligibility_doc_ref: 'L1' }), null);
  assert.match(validateStatusChange({ ...base, eligibility_status: 'approved_sale', eligibility_doc_ref: 'L1' }) ?? '', /destination/);
  assert.match(validateStatusChange({ ...selank, eligibility_status: 'approved_sale', eligibility_doc_ref: 'L1', lawful_destinations: ['GB'] }) ?? '', /price/i);
  assert.equal(validateStatusChange({ ...base, eligibility_status: 'approved_sale', eligibility_doc_ref: 'L1', lawful_destinations: ['GB'] }), null);
});

test('marketing-approved products are listed but not orderable', () => {
  const m = { ...selank, eligibility_status: 'approved_marketing' as const, eligibility_doc_ref: 'L1' };
  assert.equal(isPubliclyListed(m), true);
  const c = checkPurchase(m);
  assert.equal(c.allowed, false);
  if (!c.allowed) assert.equal(c.reason, 'marketing_only');
});

test('purchase gate', () => {
  assert.equal(checkPurchase(forSale, 'GB').allowed, true);
  assert.equal(checkPurchase(forSale, 'DE').allowed, false);
  assert.equal(checkPurchase({ ...forSale, eligibility_doc_ref: '  ' }).allowed, false);
  assert.equal(checkPurchase({ ...forSale, lawful_destinations: [] }).allowed, false);
  assert.equal(checkPurchase({ ...forSale, price_eur: 0 }).allowed, false);
  assert.equal(checkPurchase({ ...forSale, in_stock: false }).allowed, false);
  assert.equal(checkPurchase({ ...forSale, eligibility_status: 'pending_review' }).allowed, false);
});

test('quote refuses unapproved products, wrong destinations and unknown countries', () => {
  assert.equal(buildQuote([selank], [{ productId: selank.id, format: 'single', quantity: 1 }], 'GBP', 'GB').ok, false);
  assert.equal(buildQuote([forSale], [{ productId: 'p1', format: 'single', quantity: 1 }], 'EUR', 'DE').ok, false);
  assert.equal(buildQuote([forSale], [{ productId: 'p1', format: 'single', quantity: 1 }], 'GBP', 'US').ok, false);
});

test('quote totals use server prices', () => {
  const r = buildQuote([forSale], [{ productId: 'p1', format: 'single', quantity: 3 }, { productId: 'p1', format: 'kit', quantity: 1 }], 'GBP', 'GB');
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.quote.subtotal, 495); // 3×45 + 360
  assert.equal(r.quote.shipping, 8.5);
  assert.equal(r.quote.vat, 0);
  assert.equal(r.quote.total, 503.5);
});

test('per-order and stock limits', () => {
  const p = { ...forSale, max_per_order: 5 };
  assert.equal(buildQuote([p], [{ productId: 'p1', format: 'single', quantity: 3 }, { productId: 'p1', format: 'single', quantity: 3 }], 'GBP', 'GB').ok, false);
  assert.equal(buildQuote([{ ...forSale, stock_quantity: 12 }], [{ productId: 'p1', format: 'kit', quantity: 2 }], 'GBP', 'GB').ok, false);
});

test('unit price and money formatting', () => {
  assert.equal(unitPrice(forSale, 'single', 'EUR'), 52);
  assert.equal(unitPrice({ ...forSale, kit_price_gbp: null }, 'kit', 'GBP'), null);
  assert.equal(formatMoney(1234.5, 'GBP'), '£1,234.50');
  assert.equal(formatMoney(16.5, 'EUR'), '€16.50');
});

test('customer and order validation', () => {
  const ok = customerSchema.safeParse({
    name: 'Jane Doe', email: 'JANE@EXAMPLE.COM', phone: '+44 7700 900000', addressLine1: '1 High St',
    city: 'London', postalCode: 'EC1A 1BB', countryCode: 'gb', termsAccepted: true,
  });
  assert.ok(ok.success);
  if (ok.success) { assert.equal(ok.data.email, 'jane@example.com'); assert.equal(ok.data.countryCode, 'GB'); }
  assert.equal(customerSchema.safeParse({ name: 'J', email: 'x', phone: 'a', addressLine1: '', city: '', postalCode: '', countryCode: 'GB', termsAccepted: false }).success, false);
  assert.equal(orderRequestSchema.safeParse({ idempotencyKey: 'x', currency: 'GBP', customer: {}, items: [] }).success, false);
});

test('WhatsApp order summary is accurate', () => {
  const q = buildQuote([forSale], [{ productId: 'p1', format: 'single', quantity: 2 }], 'GBP', 'GB');
  assert.ok(q.ok);
  if (!q.ok) return;
  const msg = buildOrderMessage({
    reference: 'AZ-2026-123456',
    customer: { name: 'Jane Doe', email: 'jane@example.com', phone: '+447700900000', city: 'London', postalCode: 'EC1A 1BB', countryCode: 'GB' },
    quote: q.quote,
  });
  assert.match(msg, /AZ-2026-123456/);
  assert.match(msg, /Selank Nasal Spray \(AZ-SEL-10\) × 2 = £90\.00/);
  assert.match(msg, /Total: £98\.50/);
  const url = whatsappLink(msg);
  assert.ok(url.startsWith('https://wa.me/447448399290?text='));
  assert.equal(decodeURIComponent(url.split('text=')[1]), msg);
});
