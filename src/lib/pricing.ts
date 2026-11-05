import type { Product } from '@/types/product';
import type { Currency, ProductFormat, Quote, QuoteLine } from '@/types/order';
import { checkPurchase } from '@/lib/eligibility';
import { SHIPPING_COUNTRIES } from '@/lib/products-data';

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function unitPrice(
  product: Pick<Product, 'price_gbp' | 'price_eur' | 'kit_price_gbp' | 'kit_price_eur' | 'variations'>,
  format: ProductFormat,
  currency: Currency,
  variationId?: string
): number | null {
  if (variationId && product.variations) {
    const v = product.variations.find((item) => item.id === variationId);
    if (v) {
      return currency === 'EUR' ? v.price_eur : v.price_gbp;
    }
  }
  if (format === 'kit') {
    const kit = currency === 'EUR' ? product.kit_price_eur : product.kit_price_gbp;
    return kit ?? null;
  }
  return currency === 'EUR' ? product.price_eur : product.price_gbp;
}

export function formatMoney(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(currency === 'EUR' ? 'en-IE' : 'en-GB', {
    style: 'currency',
    currency,
  }).format(amount);
}

export type QuoteResult = { ok: true; quote: Quote } | { ok: false; error: string };

/**
 * Authoritative quote. Prices, eligibility, stock and limits all come from `products`,
 * never from the browser.
 */
export function buildQuote(
  products: Product[],
  items: { productId: string; format: ProductFormat; quantity: number; variationId?: string }[],
  currency: Currency,
  countryCode: string
): QuoteResult {
  const country = SHIPPING_COUNTRIES.find((c) => c.code === countryCode.toUpperCase());
  if (!country) return { ok: false, error: 'We do not currently deliver to that country.' };

  // Merge duplicate lines so per-order limits cannot be bypassed by splitting.
  const merged = new Map<string, { productId: string; format: ProductFormat; quantity: number; variationId?: string }>();
  for (const it of items) {
    const key = `${it.productId}:${it.format}:${it.variationId ?? ''}`;
    const prev = merged.get(key);
    merged.set(key, { ...it, quantity: (prev?.quantity ?? 0) + it.quantity });
  }

  const lines: QuoteLine[] = [];
  for (const it of merged.values()) {
    const product = products.find((p) => p.id === it.productId);
    if (!product) return { ok: false, error: 'One of the items in your cart is no longer available.' };

    const check = checkPurchase(product, country.code);
    if (!check.allowed) return { ok: false, error: `${product.name}: ${check.message}` };

    const totalUnits = [...merged.values()]
      .filter((m) => m.productId === product.id)
      .reduce((acc, m) => acc + m.quantity * (m.format === 'kit' ? 10 : 1), 0);
    if (it.quantity > product.max_per_order) {
      return { ok: false, error: `${product.name}: maximum ${product.max_per_order} per order.` };
    }
    if (totalUnits > product.stock_quantity) {
      return { ok: false, error: `${product.name}: only ${product.stock_quantity} units in stock.` };
    }

    const price = unitPrice(product, it.format, currency, it.variationId);
    if (price === null) return { ok: false, error: `${product.name}: that pack size is not available.` };

    let displayName = product.name;
    let displaySku = product.sku;
    if (it.variationId && product.variations) {
      const v = product.variations.find((item) => item.id === it.variationId);
      if (v) {
        displayName = `${product.name} (${v.name})`;
        displaySku = v.sku;
      }
    }
    if (it.format === 'kit') {
      displayName = `${displayName} (10-pack)`;
    }

    lines.push({
      productId: product.id,
      name: displayName,
      sku: displaySku,
      format: it.format,
      unitPrice: price,
      quantity: it.quantity,
      lineTotal: round2(price * it.quantity),
      variationId: it.variationId,
    });
  }

  const subtotal = round2(lines.reduce((a, l) => a + l.lineTotal, 0));
  const shipping = currency === 'EUR' ? country.shippingEur : country.shippingGbp;
  // VAT removed as requested
  const total = round2(subtotal + shipping);

  return { ok: true, quote: { currency, lines, subtotal, shipping, vatRate: 0, vat: 0, total } };
}
