import 'server-only';
import type { Product } from '@/types/product';
import type { AuditLogEntry, OrderRecord, OrderStatus } from '@/types/order';
import { ACTIVE_CATALOGUE } from '@/lib/products-data';
import { isPubliclyListed, validateStatusChange } from '@/lib/eligibility';
import { getPublicClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';

export const IMAGE_BUCKET = 'product-images';
const SIGNED_URL_TTL = 60 * 60 * 6; // 6 h; pages revalidate every 60 s

/** Adds URLs for images (signed URLs from private bucket if available, otherwise direct /catalogue paths). */
async function withImageUrls(products: Product[]): Promise<Product[]> {
  const sb = getServiceClient();
  const paths = [...new Set(products.flatMap((p) => p.image_paths ?? []))];

  const signedMap = new Map<string, string>();
  if (sb && paths.length > 0) {
    try {
      const { data } = await sb.storage.from(IMAGE_BUCKET).createSignedUrls(paths, SIGNED_URL_TTL);
      for (const item of data ?? []) {
        if (item.path && item.signedUrl) {
          signedMap.set(item.path, item.signedUrl);
        }
      }
    } catch {
      // Storage not connected, fallback to local catalogue paths
    }
  }

  return products.map((p) => {
    const urls = (p.image_paths ?? []).map((x) => {
      if (signedMap.has(x)) return signedMap.get(x)!;
      if (x.startsWith('http://') || x.startsWith('https://') || x.startsWith('/')) return x;
      return `/${x}`;
    }).filter(Boolean);
    return { ...p, image_urls: urls };
  });
}

/**
 * Public catalogue: only approved, documented, unrestricted products.
 * Tries Supabase first; if unconfigured, offline, or empty, gracefully serves the active catalogue.
 */
export async function fetchPublicProducts(): Promise<Product[]> {
  const sb = getPublicClient();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('products')
        .select('*')
        .eq('is_restricted', false)
        .in('eligibility_status', ['approved_marketing', 'approved_sale'])
        .not('eligibility_doc_ref', 'is', null)
        .order('name');

      if (!error && data && data.length > 0) {
        return withImageUrls((data as Product[]).filter(isPubliclyListed));
      }
      if (error) {
        console.warn('[catalogue] Supabase query failed, falling back to catalogue:', error.message);
      }
    } catch (err) {
      console.warn('[catalogue] Supabase fetch error, falling back to catalogue:', err);
    }
  }

  // Gracefully fallback to the rich, verified catalogue:
  return withImageUrls(ACTIVE_CATALOGUE.filter(isPubliclyListed));
}

export async function fetchPublicProductBySlug(slug: string): Promise<Product | null> {
  const list = await fetchPublicProducts();
  return list.find((p) => p.slug === slug) ?? null;
}

/** Authoritative product list for pricing (service role if available, otherwise ACTIVE_CATALOGUE). */
export async function fetchProductsForPricing(): Promise<Product[]> {
  const sb = getServiceClient();
  if (sb) {
    try {
      const { data, error } = await sb.from('products').select('*');
      if (!error && data && data.length > 0) {
        return (data as Product[]);
      }
    } catch {}
  }
  return ACTIVE_CATALOGUE;
}

// ---------------- Admin-only (call only after requireAdmin) ----------------

export async function adminFetchProducts(): Promise<Product[]> {
  const sb = getServiceClient();
  if (!sb) return [];
  const { data } = await sb.from('products').select('*').order('is_restricted').order('name');
  return withImageUrls((data ?? []) as Product[]);
}

export async function adminFetchOrders(): Promise<OrderRecord[]> {
  const sb = getServiceClient();
  if (!sb) return [];
  const { data } = await sb.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false }).limit(500);
  return (data ?? []) as OrderRecord[];
}

export async function adminFetchAudit(limit = 100): Promise<AuditLogEntry[]> {
  const sb = getServiceClient();
  if (!sb) return [];
  const { data } = await sb.from('audit_log').select('*').order('created_at', { ascending: false }).limit(limit);
  return (data ?? []) as AuditLogEntry[];
}

async function audit(actorEmail: string, entity: 'product' | 'order', entityId: string, action: string, before: unknown, after: unknown) {
  const sb = getServiceClient();
  if (!sb) return;
  await sb.from('audit_log').insert({ actor_email: actorEmail, entity, entity_id: entityId, action, before, after });
}

export async function adminUpdateOrderStatus(actorEmail: string, orderId: string, status: OrderStatus) {
  const sb = getServiceClient();
  if (!sb) throw new Error('Database not configured');
  const { data: before } = await sb.from('orders').select('id,status').eq('id', orderId).single();
  if (!before) throw new Error('Order not found');
  const { error } = await sb.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
  if (error) throw new Error(error.message);
  await audit(actorEmail, 'order', orderId, 'status_change', { status: before.status }, { status });
}

/** Fields an admin may set. `is_restricted` / `restriction_reason` are deliberately absent. */
export type ProductAdminFields = Partial<
  Pick<
    Product,
    | 'name' | 'slug' | 'sku' | 'category' | 'unit_size' | 'pack_contents' | 'description' | 'specifications'
    | 'cas_number' | 'sequence' | 'molecular_formula' | 'molecular_weight' | 'storage_notes'
    | 'price_gbp' | 'price_eur' | 'kit_price_gbp' | 'kit_price_eur' | 'in_stock' | 'stock_quantity' | 'max_per_order'
    | 'eligibility_status' | 'eligibility_doc_ref' | 'eligibility_conditions' | 'lawful_destinations'
    | 'coa_batch' | 'coa_date' | 'coa_url' | 'image_paths' | 'alt_text' | 'is_featured'
  >
>;

export async function adminCreateProduct(actorEmail: string, fields: ProductAdminFields & Pick<Product, 'name' | 'slug' | 'sku' | 'category' | 'unit_size' | 'description'>) {
  const sb = getServiceClient();
  if (!sb) throw new Error('Database not configured');
  const row = {
    price_gbp: 0, price_eur: 0, in_stock: false, stock_quantity: 0, max_per_order: 10,
    lawful_destinations: [], image_paths: [], specifications: {}, alt_text: fields.name,
    ...fields,
    eligibility_status: 'pending_review', // new products always start in review
  };
  const { data, error } = await sb.from('products').insert(row).select('id').single();
  if (error) throw new Error(error.code === '23505' ? 'A product with that SKU or slug already exists.' : error.message);
  await audit(actorEmail, 'product', data.id, 'create', null, row);
  return data.id as string;
}

export async function adminUpdateProduct(actorEmail: string, productId: string, patch: ProductAdminFields) {
  const sb = getServiceClient();
  if (!sb) throw new Error('Database not configured');
  const { data: before } = await sb.from('products').select('*').eq('id', productId).single();
  if (!before) throw new Error('Product not found');

  const next = { ...(before as Product), ...patch };
  const problem = validateStatusChange(next);
  if (problem) throw new Error(problem);

  const { error } = await sb.from('products').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', productId);
  if (error) throw new Error(error.message.includes('products_status_rules') ? 'Those settings are not allowed for this product.' : error.message);

  const changedBefore: Record<string, unknown> = {};
  for (const k of Object.keys(patch)) changedBefore[k] = (before as Record<string, unknown>)[k];
  await audit(actorEmail, 'product', productId, 'update', changedBefore, patch);
}

const MIME_EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export async function adminUploadImage(actorEmail: string, productId: string, file: File): Promise<string> {
  const sb = getServiceClient();
  if (!sb) throw new Error('Database not configured');
  const ext = MIME_EXT[file.type];
  if (!ext) throw new Error('Use a JPEG, PNG or WebP image.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Images must be 5 MB or smaller.');

  const { data: product } = await sb.from('products').select('id,image_paths').eq('id', productId).single();
  if (!product) throw new Error('Product not found');

  const path = `products/${productId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from(IMAGE_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);

  const image_paths = [...(product.image_paths ?? []), path];
  const { error: upErr } = await sb.from('products').update({ image_paths, updated_at: new Date().toISOString() }).eq('id', productId);
  if (upErr) throw new Error(upErr.message);
  await audit(actorEmail, 'product', productId, 'image_upload', null, { path });
  return path;
}
