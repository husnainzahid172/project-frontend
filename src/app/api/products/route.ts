import { NextResponse } from 'next/server';
import { fetchPublicProducts } from '@/lib/data';

export const revalidate = 60;

export async function GET() {
  try {
    const products = await fetchPublicProducts();
    return NextResponse.json({ success: true, products });
  } catch {
    return NextResponse.json({ success: false, error: 'Catalogue unavailable.' }, { status: 500 });
  }
}
