import type { ProductEligibilityStatus } from '@/lib/eligibility';

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku: string;
  cas_number?: string | null;
  category: ProductCategory;
  sequence?: string | null;
  molecular_formula?: string | null;
  molecular_weight?: string | null;
  grade: string;
  purity?: string | null;
  unit_size: string;
  // Single Vial Price
  price_gbp: number;
  price_eur: number;
  // 10-Vial Research Kit Box Price
  kit_price_gbp?: number;
  kit_price_eur?: number;
  in_stock: boolean;
  stock_quantity: number;
  max_per_order: number;
  lawful_destinations: string[]; // ISO 3166-1 alpha-2 codes (e.g. GB, DE, FR, NL, IE, ES, IT, BE, AT, CH)
  eligibility_status?: ProductEligibilityStatus;
  description: string;
  specifications: Record<string, string>;
  safety_notes?: string | null;
  coa_batch?: string | null;
  coa_date?: string | null;
  cap_color?: string; // Hex color for realistic 3D vial rendering
  sds_url?: string | null;
  image_url: string;
  alt_text: string;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export type ProductCategory =
  | 'All'
  | 'Tissue Repair & Cell Models'
  | 'Metabolic & Incretin Research'
  | 'Longevity & Cellular Health'
  | 'Dermal & Receptor Research'
  | 'Laboratory Solutions';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'All',
  'Tissue Repair & Cell Models',
  'Metabolic & Incretin Research',
  'Longevity & Cellular Health',
  'Dermal & Receptor Research',
  'Laboratory Solutions',
];

export interface ProductFilterState {
  searchQuery: string;
  category: ProductCategory;
  inStockOnly: boolean;
  destinationCountry: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'name-asc';
}
