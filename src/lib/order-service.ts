import 'server-only';
import { randomInt } from 'crypto';
import type { OrderCreateResponse } from '@/types/order';
import { orderRequestSchema } from '@/lib/validation';
import { buildQuote } from '@/lib/pricing';
import { fetchProductsForPricing } from '@/lib/data';
import { getServiceClient } from '@/lib/supabase/service';
import { buildOrderWhatsappUrl } from '@/lib/whatsapp';

export function generateOrderReference(): string {
  return `AZ-${new Date().getFullYear()}-${randomInt(100000, 999999)}`;
}

export async function createOrder(raw: unknown): Promise<{ status: number; body: OrderCreateResponse }> {
  const parsed = orderRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: 400,
      body: { success: false, error: 'Please check the highlighted fields.', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> },
    };
  }
  const { customer, items, currency, idempotencyKey } = parsed.data;

  let products;
  try {
    products = await fetchProductsForPricing();
  } catch {
    return { status: 503, body: { success: false, error: 'Catalogue temporarily unavailable. Please try again shortly.' } };
  }

  const result = buildQuote(products, items, currency, customer.countryCode);
  if (!result.ok) return { status: 422, body: { success: false, error: result.error } };
  const { quote } = result;

  let reference = generateOrderReference();
  let isDuplicate = false;

  const db = getServiceClient();
  if (db) {
    try {
      const orderRow = {
        reference,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        institution: customer.institution || null,
        address_line1: customer.addressLine1,
        address_line2: customer.addressLine2 || null,
        city: customer.city,
        postal_code: customer.postalCode,
        country_code: customer.countryCode,
        currency,
        subtotal: quote.subtotal,
        shipping_cost: quote.shipping,
        vat_amount: quote.vat,
        total_amount: quote.total,
        terms_accepted: true,
        notes: customer.notes || null,
      };
      const itemRows = quote.lines.map((l) => ({
        product_id: l.productId,
        product_name: l.name,
        sku: l.sku,
        format: l.format,
        unit_price: l.unitPrice,
        quantity: l.quantity,
        total_price: l.lineTotal,
      }));

      const { data, error } = await db.rpc('create_order', {
        p_idempotency_key: idempotencyKey,
        p_order: orderRow,
        p_items: itemRows,
      });

      if (!error && data) {
        const saved = Array.isArray(data) ? data[0] : data;
        if (saved?.reference) {
          reference = saved.reference;
          isDuplicate = Boolean(saved.is_duplicate);
        }
      } else if (error) {
        console.warn('[orders] Supabase create_order notification:', error.message);
      }
    } catch (dbErr) {
      console.warn('[orders] Database insert skipped, continuing with WhatsApp order:', dbErr);
    }
  }

  const whatsappUrl = buildOrderWhatsappUrl({
    reference,
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      addressLine1: customer.addressLine1,
      city: customer.city,
      postalCode: customer.postalCode,
      countryCode: customer.countryCode,
      institution: customer.institution || undefined,
      notes: customer.notes || undefined,
    },
    quote,
  });

  return {
    status: isDuplicate ? 200 : 201,
    body: { success: true, reference, quote, whatsappUrl, duplicate: isDuplicate },
  };
}
