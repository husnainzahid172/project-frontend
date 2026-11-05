import type { Quote } from '@/types/order';
import type { ResolvedCartLine } from '@/lib/cart-context';
import { formatMoney, unitPrice } from '@/lib/pricing';
import { SHIPPING_COUNTRIES } from '@/lib/products-data';
import { whatsappLink } from '@/lib/site-config';

/** The single WhatsApp order-summary builder. */
export function buildOrderMessage(params: {
  reference: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    addressLine1?: string;
    city: string;
    postalCode: string;
    countryCode: string;
    institution?: string;
    notes?: string;
  };
  quote: Quote;
}): string {
  const { reference, customer, quote } = params;
  const m = (n: number) => formatMoney(n, quote.currency);
  const country = SHIPPING_COUNTRIES.find((c) => c.code === customer.countryCode)?.name ?? customer.countryCode;

  const lines = quote.lines.map((l, i) => {
    const formatSuffix = l.format === 'kit' ? ' (10-pack)' : '';
    return `${i + 1}. ${l.name}${formatSuffix} (${l.sku}) × ${l.quantity} = ${m(l.lineTotal)}`;
  });

  return [
    `AZ Labs order ${reference}`,
    '',
    `Name: ${customer.name}`,
    ...(customer.institution ? [`Organisation: ${customer.institution}`] : []),
    `Email: ${customer.email}`,
    `Phone: ${customer.phone}`,
    `Delivery: ${customer.addressLine1 ? `${customer.addressLine1}, ` : ''}${customer.city}, ${customer.postalCode}, ${country}`,
    ...(customer.notes ? [`Notes: ${customer.notes}`] : []),
    '',
    ...lines,
    '',
    `Subtotal: ${m(quote.subtotal)}`,
    `Shipping: ${m(quote.shipping)}`,
    `Total: ${m(quote.total)}`,
    '',
    'Please confirm availability, dispatch timescale and payment details. Thank you!',
  ].join('\n');
}

export function buildOrderWhatsappUrl(params: Parameters<typeof buildOrderMessage>[0]): string {
  return whatsappLink(buildOrderMessage(params));
}

/** Prepares a quick WhatsApp message directly from the cart drawer. */
export function buildCartQuickOrderMessage(lines: ResolvedCartLine[], currency: 'GBP' | 'EUR'): string {
  const m = (n: number) => formatMoney(n, currency);
  const subtotal = lines.reduce((acc, l) => acc + (unitPrice(l.product, l.format, currency, l.variationId) ?? 0) * l.quantity, 0);

  const items = lines.map((l, i) => {
    const price = (unitPrice(l.product, l.format, currency, l.variationId) ?? 0) * l.quantity;
    const variationSuffix = l.variationName ? ` (${l.variationName})` : '';
    const formatSuffix = l.format === 'kit' ? ' (10-pack)' : '';
    return `${i + 1}. ${l.product.name}${variationSuffix}${formatSuffix} [${l.product.sku}] × ${l.quantity} = ${m(price)}`;
  });

  return [
    'Hello AZ Labs, I would like to place an order:',
    '',
    '🛒 *Cart Items:*',
    ...items,
    '',
    `*Estimated Subtotal:* ${m(subtotal)}`,
    '',
    'Please confirm product availability, delivery quote, and payment instructions.',
    'Thank you!',
  ].join('\n');
}

export function buildCartQuickOrderWhatsappUrl(lines: ResolvedCartLine[], currency: 'GBP' | 'EUR'): string {
  return whatsappLink(buildCartQuickOrderMessage(lines, currency));
}
