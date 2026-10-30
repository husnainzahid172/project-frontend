import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product } from '@/types/product';
import { OrderRecord, OrderItemRecord, OrderStatus } from '@/types/order';
import { INITIAL_PRODUCTS } from '@/lib/products-data';

// Read configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Server or browser client
let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || (!supabaseAnonKey && !supabaseServiceKey)) {
    return null;
  }
  if (!supabaseClient) {
    const key = supabaseServiceKey || supabaseAnonKey;
    supabaseClient = createClient(supabaseUrl, key, {
      auth: {
        persistSession: false,
      },
    });
  }
  return supabaseClient;
}

// In-Memory fallback store for seamless demonstration and testing
// if Supabase credentials have not yet been provided in .env
interface FallbackDatabase {
  products: Product[];
  orders: OrderRecord[];
}

const fallbackDb: FallbackDatabase = {
  products: [...INITIAL_PRODUCTS],
  orders: [
    {
      id: 'ord-demo-001',
      reference: 'AZ-2026-94812',
      customer_name: 'Dr. Evelyn Reed',
      customer_email: 'e.reed@oxford-research.ac.uk',
      customer_phone: '+44 7700 900142',
      institution: 'Oxford Analytical Institute',
      address_line1: 'Department of Chemistry, South Parks Road',
      address_line2: 'Suite 4B',
      city: 'Oxford',
      postal_code: 'OX1 3QR',
      country_code: 'GB',
      currency: 'GBP',
      subtotal: 187.0,
      shipping_cost: 12.5,
      vat_amount: 37.4,
      total_amount: 236.9,
      status: 'confirmed',
      compliance_confirmed: true,
      notes: 'Please pack in cold-chain thermal packaging with batch CoAs.',
      whatsapp_opened_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 20).toISOString(),
      items: [
        {
          id: 'item-001',
          order_id: 'ord-demo-001',
          product_id: 'pep-001',
          product_name: 'BPC-157 Research Peptide (10mg) [10-Vial Kit Box]',
          sku: 'AZ-BPC-10',
          unit_price: 360.0,
          quantity: 1,
          total_price: 360.0,
          created_at: new Date().toISOString(),
        },
        {
          id: 'item-002',
          order_id: 'ord-demo-001',
          product_id: 'pep-012',
          product_name: 'Bacteriostatic Water with 0.9% Benzyl Alcohol (30mL) [Single Vial]',
          sku: 'AZ-BAC-30',
          unit_price: 14.0,
          quantity: 2,
          total_price: 28.0,
          created_at: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'ord-demo-002',
      reference: 'AZ-2026-88104',
      customer_name: 'Prof. Markus Weber',
      customer_email: 'markus.weber@biotech-munich.de',
      customer_phone: '+49 151 23456789',
      institution: 'Munich BioTech Diagnostics GmbH',
      address_line1: 'Am Klopferspitz 19',
      address_line2: '',
      city: 'Planegg-Martinsried',
      postal_code: '82152',
      country_code: 'DE',
      currency: 'EUR',
      subtotal: 245.0,
      shipping_cost: 16.5,
      vat_amount: 46.55,
      total_amount: 308.05,
      status: 'pending_contact',
      compliance_confirmed: true,
      notes: 'Please include HPLC batch Certificate of Analysis with cold packs.',
      whatsapp_opened_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      items: [
        {
          id: 'item-003',
          order_id: 'ord-demo-002',
          product_id: 'pep-004',
          product_name: 'GLP3-RT Triple Receptor Research Peptide (10mg) [Single Vial]',
          sku: 'AZ-GLP3-10',
          unit_price: 135.0,
          quantity: 1,
          total_price: 135.0,
          created_at: new Date().toISOString(),
        },
        {
          id: 'item-004',
          order_id: 'ord-demo-002',
          product_id: 'pep-005',
          product_name: 'GLP2-TZ Dual Receptor Incretin Peptide (15mg) [Single Vial]',
          sku: 'AZ-GLP2-15',
          unit_price: 110.0,
          quantity: 1,
          total_price: 110.0,
          created_at: new Date().toISOString(),
        },
      ],
    },
  ],
};

// Database Access Methods
export async function fetchProducts(): Promise<Product[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('products')
        .select('*')
        .order('is_featured', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch (e) {
      console.warn('Supabase fetch products error, falling back to local dataset:', e);
    }
  }
  return fallbackDb.products;
}

export async function fetchProductById(idOrSlug: string): Promise<Product | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('products')
        .select('*')
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .single();
      if (!error && data) {
        return data as Product;
      }
    } catch {
      // fallback
    }
  }
  const found = fallbackDb.products.find(
    (p) => p.id === idOrSlug || p.slug === idOrSlug
  );
  return found || null;
}

export async function saveOrderToDatabase(
  order: Omit<OrderRecord, 'id' | 'created_at' | 'updated_at'>,
  items: Array<{
    productId: string;
    productName: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }>
): Promise<{ order: OrderRecord; error?: string }> {
  const sb = getSupabase();
  const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  const fullOrder: OrderRecord = {
    ...order,
    id: orderId,
    created_at: now,
    updated_at: now,
    items: items.map((it, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      order_id: orderId,
      product_id: it.productId,
      product_name: it.productName,
      sku: it.sku,
      unit_price: it.unitPrice,
      quantity: it.quantity,
      total_price: it.totalPrice,
      created_at: now,
    })),
  };

  if (sb) {
    try {
      const { data: insertedOrder, error: orderErr } = await sb
        .from('orders')
        .insert({
          reference: order.reference,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          institution: order.institution,
          address_line1: order.address_line1,
          address_line2: order.address_line2,
          city: order.city,
          postal_code: order.postal_code,
          country_code: order.country_code,
          currency: order.currency,
          subtotal: order.subtotal,
          shipping_cost: order.shipping_cost,
          vat_amount: order.vat_amount,
          total_amount: order.total_amount,
          status: order.status,
          compliance_confirmed: order.compliance_confirmed,
          notes: order.notes,
        })
        .select()
        .single();

      if (orderErr) {
        console.error('Supabase insert order error:', orderErr);
        // Fall back to local store
        fallbackDb.orders.unshift(fullOrder);
        return { order: fullOrder };
      }

      if (insertedOrder) {
        const orderDbId = insertedOrder.id;
        const itemInserts = items.map((it) => ({
          order_id: orderDbId,
          product_id: it.productId,
          product_name: it.productName,
          sku: it.sku,
          unit_price: it.unitPrice,
          quantity: it.quantity,
          total_price: it.totalPrice,
        }));

        await sb.from('order_items').insert(itemInserts);
        fullOrder.id = orderDbId;
      }
    } catch (e) {
      console.warn('Supabase order transaction failed, using in-memory store:', e);
      fallbackDb.orders.unshift(fullOrder);
      return { order: fullOrder };
    }
  } else {
    fallbackDb.orders.unshift(fullOrder);
  }

  return { order: fullOrder };
}

export async function fetchAllOrders(): Promise<OrderRecord[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as OrderRecord[];
      }
    } catch (e) {
      console.warn('Supabase fetch orders error, falling back to local orders:', e);
    }
  }
  return fallbackDb.orders;
}

export async function updateOrderStatusInDb(
  orderId: string,
  newStatus: OrderStatus
): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (!error) return true;
    } catch {
      // fallback
    }
  }

  const order = fallbackDb.orders.find((o) => o.id === orderId || o.reference === orderId);
  if (order) {
    order.status = newStatus;
    order.updated_at = new Date().toISOString();
    return true;
  }
  return false;
}
