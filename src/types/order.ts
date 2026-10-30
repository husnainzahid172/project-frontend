export type OrderStatus =
  | 'pending_contact'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'completed'
  | 'cancelled';

export type ProductFormat = 'single' | 'kit';

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  institution?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  countryCode: string; // e.g. 'GB', 'DE', 'FR', 'NL', 'IE'
  notes?: string;
  complianceConfirmed: boolean;
}

export interface CartItem {
  product: {
    id: string;
    slug: string;
    name: string;
    sku: string;
    grade: string;
    purity?: string | null;
    unit_size: string;
    price_gbp: number;
    price_eur: number;
    kit_price_gbp?: number;
    kit_price_eur?: number;
    in_stock: boolean;
    stock_quantity: number;
    max_per_order: number;
    cap_color?: string;
    image_url: string;
    alt_text: string;
    lawful_destinations: string[];
  };
  format: ProductFormat; // 'single' = Single Vial, 'kit' = 10-Vial Box
  quantity: number;
}

export interface OrderItemRecord {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  format?: ProductFormat;
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
  currency: 'GBP' | 'EUR';
  subtotal: number;
  shipping_cost: number;
  vat_amount: number;
  total_amount: number;
  status: OrderStatus;
  compliance_confirmed: boolean;
  notes?: string | null;
  whatsapp_opened_at?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItemRecord[];
}

export interface OrderCreateRequest {
  customer: CustomerDetails;
  items: {
    productId: string;
    format?: ProductFormat;
    quantity: number;
  }[];
  currency: 'GBP' | 'EUR';
}

export interface OrderCreateSuccessResponse {
  success: true;
  order: {
    id: string;
    reference: string;
    customer_name: string;
    currency: 'GBP' | 'EUR';
    subtotal: number;
    shipping_cost: number;
    vat_amount: number;
    total_amount: number;
    status: OrderStatus;
    created_at: string;
    items: {
      name: string;
      sku: string;
      format?: ProductFormat;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[];
  };
  whatsappUrl: string;
  message: string;
}

export interface OrderCreateErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}
