export type OrderStatus =
  | 'pending_contact'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'completed'
  | 'cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
  'pending_contact',
  'confirmed',
  'processing',
  'dispatched',
  'completed',
  'cancelled',
];

export type ProductFormat = 'single' | 'kit';
export type Currency = 'GBP' | 'EUR';

export interface CartItem {
  productId: string;
  format: ProductFormat;
  quantity: number;
  variationId?: string;
}

export interface OrderItemRecord {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  sku: string;
  format?: ProductFormat | null;
  unit_price: number;
  quantity: number;
  total_price: number;
  created_at: string;
}

export interface OrderRecord {
  id: string;
  reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  institution?: string | null;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  postal_code: string;
  country_code: string;
  currency: Currency;
  subtotal: number;
  shipping_cost: number;
  vat_amount: number;
  total_amount: number;
  status: OrderStatus;
  terms_accepted?: boolean | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItemRecord[];
}

export interface AuditLogEntry {
  id: string;
  actor_email: string | null;
  entity: 'product' | 'order';
  entity_id: string;
  action: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  created_at: string;
}

export interface QuoteLine {
  productId: string;
  name: string;
  sku: string;
  format: ProductFormat;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  variationId?: string;
}

export interface Quote {
  currency: Currency;
  lines: QuoteLine[];
  subtotal: number;
  shipping: number;
  vatRate: number;
  vat: number;
  total: number;
}

export type OrderCreateResponse =
  | {
      success: true;
      reference: string;
      quote: Quote;
      whatsappUrl: string;
      duplicate?: boolean;
    }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
