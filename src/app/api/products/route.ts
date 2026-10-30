import { NextResponse } from 'next/server';
import { fetchProducts } from '@/lib/supabase';

export async function GET() {
  try {
    const products = await fetchProducts();
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch catalogue.' },
      { status: 500 }
    );
  }
}
