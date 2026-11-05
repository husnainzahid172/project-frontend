import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, canWrite } from '@/lib/admin-auth';
import { adminCreateProduct, adminUpdateProduct } from '@/lib/data';
import { ELIGIBILITY_STATUSES } from '@/types/product';

const iso2 = z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/);
const nullableText = (max: number) => z.string().trim().max(max).transform((v) => (v === '' ? null : v)).nullable();
const money = z.number().min(0).max(100_000);

const fields = z
  .object({
    name: z.string().trim().min(2).max(120),
    slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug: lowercase letters, numbers and hyphens').max(120),
    sku: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,40}$/, 'SKU: letters, numbers and hyphens'),
    category: z.string().trim().min(2).max(60),
    unit_size: z.string().trim().min(1).max(120),
    pack_contents: nullableText(200),
    description: z.string().trim().min(5).max(2000),
    specifications: z.record(z.string().max(80), z.string().max(300)),
    cas_number: nullableText(60),
    sequence: nullableText(500),
    molecular_formula: nullableText(120),
    molecular_weight: nullableText(60),
    storage_notes: nullableText(500),
    price_gbp: money,
    price_eur: money,
    kit_price_gbp: money.nullable(),
    kit_price_eur: money.nullable(),
    in_stock: z.boolean(),
    stock_quantity: z.number().int().min(0).max(1_000_000),
    max_per_order: z.number().int().min(1).max(1000),
    eligibility_status: z.enum(ELIGIBILITY_STATUSES as [string, ...string[]]),
    eligibility_doc_ref: nullableText(300),
    eligibility_conditions: nullableText(1000),
    lawful_destinations: z.array(iso2).max(40),
    coa_batch: nullableText(80),
    coa_date: nullableText(40),
    coa_url: z.string().trim().url().max(500).nullable().or(z.literal('').transform(() => null)),
    image_paths: z.array(z.string().max(300).regex(/^[\w\-/.]+$/)).max(10),
    alt_text: z.string().trim().max(200),
    is_featured: z.boolean(),
  })
  .partial()
  .strict(); // rejects is_restricted / restriction_reason / unknown keys

async function guard() {
  const admin = await requireAdmin();
  if (!admin) return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  if (!canWrite(admin)) return { error: NextResponse.json({ success: false, error: 'Read-only account' }, { status: 403 }) };
  return { admin };
}

export async function POST(req: NextRequest) {
  const g = await guard();
  if ('error' in g) return g.error;
  const parsed = fields.required({ name: true, slug: true, sku: true, category: true, unit_size: true, description: true }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
  try {
    const id = await adminCreateProduct(g.admin.email, parsed.data as never);
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const g = await guard();
  if ('error' in g) return g.error;
  const parsed = z.object({ productId: z.string().min(1).max(64), patch: fields }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
  try {
    await adminUpdateProduct(g.admin.email, parsed.data.productId, parsed.data.patch as never);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 400 });
  }
}
